import { pageLocale } from '../src/lib/page-locale';
import { solved } from './fixtures/context-missions';
import { describe, expect, it } from 'vitest';
import { checkMission, integer, missionIds, riskScenarios, robotTrace, businessBalance } from '../src/lib/missions/model';
import { missions, initialInputs, sanitizeInputs } from '../src/lib/missions/catalog';
import { marketingJournal } from '../src/lib/marketing-journal';
import { visualWorlds } from '../src/lib/marketing-worlds';
import { resolvePortalRoute } from '../src/lib/portal-routing';

describe('contextual mission rules',()=>{
  for(const id of missionIds){
    it(`${id} needs a solution, rejects edits, and accepts a corrected solution`,()=>{
      expect(checkMission(id,initialInputs(id)).passed).toBe(false);
      expect(checkMission(id,solved[id]).passed).toBe(true);
      for(const key of Object.keys(solved[id])) expect(checkMission(id,{...solved[id],[key]:''}).passed,`${id}.${key}`).toBe(false);
      expect(checkMission(id,solved[id]).passed).toBe(true);
    });
  }
  it('accepts multiple valid half shapes and more than one feasible allocation',()=>{
    expect(checkMission('equal-halves',{cells:'0,1,2,3,4,5',halfEight:'4'}).passed).toBe(true);
    expect(checkMission('equal-halves',{cells:'0,0,1,1,2,2',halfEight:'4'}).passed).toBe(false);
    expect(checkMission('risk-lab',{allocation:'40',lowest:'94',risk:'remains'}).passed).toBe(true);
    expect(checkMission('risk-lab',{allocation:'60',lowest:'86',risk:'remains'}).passed).toBe(false);
  });
  it('keeps arithmetic and bounded models consistent',()=>{
    expect(robotTrace(4).at(-1)).toEqual({x:0,y:0});
    expect(robotTrace(1000)).toEqual([]);
    expect(riskScenarios(50)).toMatchObject({first:105,second:90});
    expect(riskScenarios(33)).toBeNull();
    expect(businessBalance(5)).toMatchObject({revenue:20,variable:12,fixed:6,balance:2});
    expect(businessBalance(5,2)?.balance).toBe(-2);
    for(const value of ['', '1e2', 'NaN', '4.5', '999999999999999999']) expect(integer(value)).toBeNull();
  });
  it('sanitizes untrusted drafts without accepting unknown or out-of-range settings',()=>{
    expect(sanitizeInputs('risk-lab',{allocation:'33',lowest:'90',risk:'remains',name:'child'})).toEqual({...initialInputs('risk-lab'),lowest:'90',risk:'remains'});
    expect(sanitizeInputs('business-lab',{price:'999'}).price).toBe('3');
    expect(sanitizeInputs('paper-robot',{direction:'malicious',repeats:'6'})).toMatchObject({direction:'',repeats:'6'});
  });
  it('maps every article and visual vertical to a real contextual mission',()=>{
    expect(new Set(missions.map(m=>m.id)).size).toBe(10);
    for(const articles of Object.values(marketingJournal)) {
      expect(new Set(articles.map(a=>a.missionId)).size).toBe(articles.length);
      for(const article of articles) expect(missions.some(m=>m.id===article.missionId)).toBe(true);
    }
    expect(new Set(visualWorlds.map(w=>w.missionId)).size).toBe(visualWorlds.length);
    for(const world of visualWorlds) expect(missions.some(m=>m.id===world.missionId)).toBe(true);
    for(const mission of missions) for(const localeIndex of [0,1,2]) for(const value of [mission.title,mission.summary,mission.goal,mission.success]) expect(value[localeIndex].trim().length).toBeGreaterThan(5);
  });
  it('uses the same language policy on server and client navigation',()=>{
    expect(pageLocale('/missions/heart-route')).toBe('es');
    expect(pageLocale('/en/missions/heart-route')).toBe('en');
    expect(pageLocale('/ru/missions/heart-route')).toBe('ru');
    expect(pageLocale('/privacy')).toBe('en');
    expect(pageLocale('/ru/missions/heart-route',true)).toBe('en');
  });
  it('keeps mission destinations on the public host',()=>{
    expect(resolvePortalRoute('app.educationos.space','/missions/heart-route','portal')).toMatchObject({action:'redirect',destination:'https://educationos.space/missions/heart-route'});
    expect(resolvePortalRoute('app.educationos.space','/ru/missions/heart-route','portal')).toMatchObject({action:'redirect',destination:'https://educationos.space/ru/missions/heart-route'});
  });
});
