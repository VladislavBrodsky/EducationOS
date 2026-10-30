"""Studio authorization, versioned publication, moderation and tenant isolation regressions."""

from datetime import timedelta
from uuid import uuid4

import pytest
from sqlalchemy import select

from educationos.adult import AdultAccount, AdultAuthSession, email_locator, password_digest
from educationos.auth import hash_token, new_token, now
from educationos.studio import StudioAudit, StudioMission, StudioRevision

AGE_BANDS = ["5-6", "7-9", "10-12", "13-15", "16-17"]


def mission_data(title="Make a paper bridge"):
    return {
        "title": title,
        "summary": "Explore how changing a paper structure changes the load it can support.",
        "trizPrinciple": "Change the shape while preserving the material",
        "stages": [
            {
                "ageBand": age,
                "challenge": f"Investigate a paper bridge with adult guidance at stage {age}.",
                "steps": [
                    "Notice how the sheet bends between two supports.",
                    "Describe the need for both lightness and strength.",
                    "Sketch at least two different folded shapes.",
                    "Predict which shape will support more paper counters.",
                    "Compare shapes using equal supports and paper counters.",
                    "Describe what changed and what the observation suggests.",
                    "Find another familiar object that uses folded shapes.",
                ],
                "safetyNote": "Use paper counters on a clear table with adult supervision.",
            }
            for age in AGE_BANDS
        ],
    }


async def adult_headers(app, role="educator", tenant_id=None):
    tenant = tenant_id or uuid4()
    token = new_token()
    account_id = uuid4()
    async for session in app.state.database.session():
        session.add(
            AdultAccount(
                id=account_id,
                tenant_id=tenant,
                email_hash=email_locator(f"{account_id}@example.test"),
                password_hash=password_digest("fixture-password-long"),
                role=role,
                adult_attested=True,
                identity_verified=False,
            )
        )
        await session.flush()
        session.add(
            AdultAuthSession(
                token_hash=hash_token(token),
                account_id=account_id,
                expires_at=now() + timedelta(hours=1),
            )
        )
    return {"Authorization": f"Bearer {token}"}, account_id, tenant


@pytest.fixture
async def studio_adults(fixture_app):
    educator, author_id, tenant = await adult_headers(fixture_app)
    reviewer, reviewer_id, _ = await adult_headers(fixture_app, "reviewer", tenant)
    guardian, _, _ = await adult_headers(fixture_app, "guardian", tenant)
    outsider, _, _ = await adult_headers(fixture_app, "educator")
    other_educator, _, _ = await adult_headers(fixture_app, "educator", tenant)
    return {
        "educator": educator,
        "author_id": author_id,
        "reviewer": reviewer,
        "reviewer_id": reviewer_id,
        "guardian": guardian,
        "outsider": outsider,
        "other_educator": other_educator,
        "tenant": tenant,
    }


async def create(client, headers, data=None):
    response = await client.post(
        "/api/v1/studio/missions", headers=headers, json=data or mission_data()
    )
    assert response.status_code == 201, response.text
    return response.json()


async def submit(client, headers, row):
    response = await client.post(
        f"/api/v1/studio/missions/{row['id']}/submit",
        headers=headers,
        json={"expectedVersion": row["version"]},
    )
    assert response.status_code == 200, response.text
    return response.json()


async def review(client, headers, row, decision="approve"):
    return await client.post(
        f"/api/v1/studio/missions/{row['id']}/review",
        headers=headers,
        json={
            "expectedVersion": row["version"],
            "decision": decision,
            "safetyReviewed": True,
            "note": "Reviewed each age stage and the supervised paper activity for safety.",
        },
    )


async def test_private_routes_require_adult_and_roles(client, auth, studio_adults):
    url = "/api/v1/studio/missions"
    assert (await client.get(url)).status_code == 401
    assert (await client.get(url, headers=auth)).status_code == 401
    assert (await client.get(url, headers=studio_adults["guardian"])).status_code == 403
    for role in ("guardian", "reviewer"):
        response = await client.post(url, headers=studio_adults[role], json=mission_data())
        assert response.status_code == 403
    assert (await client.get(url, headers=studio_adults["reviewer"])).json() == {"items": []}


async def test_draft_review_publication_history_and_previous_snapshot(client, studio_adults):
    a = studio_adults
    row = await create(client, a["educator"])
    assert row["version"] == 1 and row["status"] == "draft"
    assert row["authorId"] == str(a["author_id"])
    assert row["moderationFlags"] == []
    assert (await client.get("/api/v1/curriculum/published")).json() == {"items": []}
    submitted = await submit(client, a["educator"], row)
    assert submitted["version"] == 2 and submitted["status"] == "review"
    assert (await review(client, a["educator"], submitted)).status_code == 403
    approved_response = await review(client, a["reviewer"], submitted)
    assert approved_response.status_code == 200, approved_response.text
    approved = approved_response.json()
    assert approved["version"] == 3 and approved["status"] == "published"
    public = (await client.get("/api/v1/curriculum/published")).json()["items"]
    assert len(public) == 1 and public[0]["version"] == 3
    assert "authorId" not in public[0] and "tenantId" not in public[0]
    new_content = mission_data("A revised paper bridge")
    response = await client.patch(
        f"/api/v1/studio/missions/{row['id']}",
        headers=a["educator"],
        json={**new_content, "expectedVersion": approved["version"]},
    )
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "draft" and response.json()["version"] == 4
    assert (await client.get("/api/v1/curriculum/published")).json()["items"] == public
    history = (
        await client.get(f"/api/v1/studio/missions/{row['id']}/history", headers=a["reviewer"])
    ).json()
    assert [v["version"] for v in history["versions"]] == [1, 2, 3, 4]
    assert [v["status"] for v in history["versions"]] == ["draft", "review", "published", "draft"]
    assert history["versions"][0]["content"]["title"] == row["title"]
    assert history["versions"][3]["content"]["title"] == "A revised paper bridge"
    assert [e["action"] for e in history["events"]] == [
        "created",
        "submitted",
        "approved",
        "edited",
    ]
    assert history["events"][2]["actorId"] == str(a["reviewer_id"])


async def test_review_is_exact_revision_and_drafts_cannot_publish(client, studio_adults):
    a = studio_adults
    row = await create(client, a["educator"])
    assert (await review(client, a["reviewer"], row)).status_code == 409
    row = await submit(client, a["educator"], row)
    url = f"/api/v1/studio/missions/{row['id']}"
    edit = await client.patch(
        url, headers=a["educator"], json={**mission_data(), "expectedVersion": row["version"]}
    )
    assert edit.status_code == 409
    unacknowledged = await client.post(
        url + "/review",
        headers=a["reviewer"],
        json={
            "expectedVersion": row["version"],
            "decision": "approve",
            "note": "The review note does not replace the explicit acknowledgement.",
        },
    )
    assert unacknowledged.status_code == 422
    assert unacknowledged.json()["error"]["code"] == "SAFETY_REVIEW_REQUIRED"
    stale = {**row, "version": 1}
    assert (await review(client, a["reviewer"], stale)).status_code == 409
    rejected = await review(client, a["reviewer"], row, "reject")
    assert rejected.status_code == 200 and rejected.json()["status"] == "draft"
    assert (await client.get("/api/v1/curriculum/published")).json()["items"] == []


async def test_tenants_and_ownership_cannot_be_supplied_by_client(client, studio_adults):
    a = studio_adults
    row = await create(client, a["educator"])
    url = f"/api/v1/studio/missions/{row['id']}"
    assert (await client.get(url, headers=a["outsider"])).status_code == 404
    assert (await client.get(url + "/history", headers=a["outsider"])).status_code == 404
    assert (await client.get("/api/v1/studio/missions", headers=a["outsider"])).json() == {
        "items": []
    }
    for headers in (a["other_educator"], a["reviewer"]):
        assert (
            await client.patch(url, headers=headers, json={**mission_data(), "expectedVersion": 1})
        ).status_code == 403
    forged = {**mission_data(), "authorId": str(a["reviewer_id"]), "status": "published"}
    assert (
        await client.post("/api/v1/studio/missions", headers=a["educator"], json=forged)
    ).status_code == 422


async def test_optimistic_lock_prevents_lost_update_and_extra_audit(
    client, fixture_app, studio_adults
):
    a = studio_adults
    row = await create(client, a["educator"])
    url = f"/api/v1/studio/missions/{row['id']}"
    update = {**mission_data("A first revision"), "expectedVersion": 1}
    assert (await client.patch(url, headers=a["educator"], json=update)).status_code == 200
    stale = {**mission_data("An outdated revision"), "expectedVersion": 1}
    assert (await client.patch(url, headers=a["educator"], json=stale)).status_code == 409
    stored = (await client.get(url, headers=a["educator"])).json()
    assert stored["title"] == "A first revision" and stored["version"] == 2
    async for session in fixture_app.state.database.session():
        revisions = list(await session.scalars(select(StudioRevision)))
        audit = list(await session.scalars(select(StudioAudit)))
    assert len(revisions) == len(audit) == 2


async def test_role_change_does_not_allow_self_review(client, fixture_app, studio_adults):
    a = studio_adults
    row = await submit(client, a["educator"], await create(client, a["educator"]))
    async for session in fixture_app.state.database.session():
        account = await session.get(AdultAccount, a["author_id"])
        account.role = "reviewer"
    assert (await review(client, a["educator"], row)).status_code == 403


@pytest.mark.parametrize(
    "mutation",
    [
        lambda d: d.update(title="<script>alert(1)</script>"),
        lambda d: d.update(title="Paper bridge \U0001f680"),
        lambda d: d.update(summary="Send your full name and your email to continue."),
        lambda d: d["stages"][0]["steps"].__setitem__(0, "Go to https://example.test now"),
        lambda d: d["stages"][0].update(ageBand="10-12"),
        lambda d: d["stages"][0].update(steps=["Notice a shape"]),
        lambda d: d.update(trizPrinciple="Contact teacher@example.test for instructions"),
    ],
)
async def test_unsafe_unstructured_or_incomplete_input_rejected(client, studio_adults, mutation):
    data = mission_data()
    mutation(data)
    response = await client.post(
        "/api/v1/studio/missions", headers=studio_adults["educator"], json=data
    )
    assert response.status_code == 422
    assert "script" not in response.text and "teacher@example.test" not in response.text


async def test_hazardous_draft_flagged_and_cannot_publish(client, studio_adults):
    a = studio_adults
    data = mission_data()
    data["stages"][0]["challenge"] = "Use a razor to make a new paper structure and test it."
    row = await create(client, a["educator"], data)
    assert row["moderationFlags"] == ["sharp_tools"]
    row = await submit(client, a["educator"], row)
    response = await review(client, a["reviewer"], row)
    assert response.status_code == 422 and response.json()["error"]["code"] == "MODERATION_REQUIRED"
    assert (await client.get("/api/v1/curriculum/published")).json()["items"] == []
    history = (
        await client.get(f"/api/v1/studio/missions/{row['id']}/history", headers=a["reviewer"])
    ).json()
    assert len(history["versions"]) == len(history["events"]) == 2
    assert history["events"][1]["moderationFlags"] == ["sharp_tools"]


async def test_production_workspace_closed(client, fixture_app, studio_adults):
    fixture_app.state.settings.environment = "production"
    assert (
        await client.get("/api/v1/studio/missions", headers=studio_adults["educator"])
    ).status_code == 503
    assert (await client.get("/api/v1/curriculum/published")).status_code == 503


async def test_db_consistency_records_all_transitions(client, fixture_app, studio_adults):
    a = studio_adults
    row = await submit(client, a["educator"], await create(client, a["educator"]))
    assert (await review(client, a["reviewer"], row)).status_code == 200
    async for session in fixture_app.state.database.session():
        mission = await session.scalar(select(StudioMission))
        revisions = list(await session.scalars(select(StudioRevision)))
        audit = list(await session.scalars(select(StudioAudit)))
        assert mission.version == mission.published_version == 3
        assert len(revisions) == len(audit) == 3
        assert revisions[2].content == mission.content
