import type { Locale } from './marketing-i18n';

export const paperBridgeCopy = {
  es: {
    goal: 'Tu reto: crea un puente con pliegues usando la misma hoja. Después, identifica qué cambió',
    shapeStep: '1 · Cambia la forma', principleStep: '2 · Explica tu cambio', question: '¿Qué cambiaste al doblar la misma hoja?',
    choose: 'Elige una explicación', options: ['La forma del papel', 'El material del papel', 'El número de apoyos'],
    review: 'Revisar esta respuesta', check: 'Comprobar mi solución', reset: 'Empezar de nuevo', successTitle: 'Reto resuelto', errorTitle: 'Revisa tu solución',
    fold: 'El reto pide un puente con pliegues. Elige «Papel doblado» y vuelve a comprobarlo.',
    missing: 'Elige qué cambió al doblar la hoja. Después, comprueba tu solución.',
    shape: 'Sigue siendo papel y hay dos apoyos. Compara las dos vistas: ¿qué cambió en la hoja?',
    success: 'Lo resolviste: cambiaste la forma sin añadir papel ni apoyos. Puedes aplicar esta idea en la misión completa.',
    noScript: 'Activa JavaScript para cambiar el modelo y comprobar tu respuesta. La ilustración no simula la resistencia del papel.',
  },
  en: {
    goal: 'Your challenge: make a folded bridge using the same sheet. Then identify what changed',
    shapeStep: '1 · Change the shape', principleStep: '2 · Explain your change', question: 'What changed when you folded the same sheet?',
    choose: 'Choose an explanation', options: ['The shape of the paper', 'The paper material', 'The number of supports'],
    review: 'Review this answer', check: 'Check my solution', reset: 'Start again', successTitle: 'Challenge solved', errorTitle: 'Review your solution',
    fold: 'The challenge asks for a folded bridge. Choose Folded paper, then check again.',
    missing: 'Choose what changed when the sheet was folded. Then check your solution.',
    shape: 'It is still paper, and there are still two supports. Compare the two views: what changed about the sheet?',
    success: 'You solved it: you changed the shape without adding paper or supports. Try this idea in the full mission.',
    noScript: 'Enable JavaScript to change the model and check your answer. The illustration does not simulate paper strength.',
  },
  ru: {
    goal: 'Ваша задача: сложите мост из того же листа. Затем объясните, что изменилось',
    shapeStep: '1 · Измените форму', principleStep: '2 · Объясните изменение', question: 'Что изменилось, когда вы сложили тот же лист?',
    choose: 'Выберите объяснение', options: ['Форма бумаги', 'Материал бумаги', 'Количество опор'],
    review: 'Вернуться к ответу', check: 'Проверить решение', reset: 'Начать заново', successTitle: 'Задача решена', errorTitle: 'Проверьте своё решение',
    fold: 'В задаче нужен мост со складками. Выберите «Сложенный лист» и проверьте ещё раз.',
    missing: 'Выберите, что изменилось при складывании листа. Затем проверьте решение.',
    shape: 'Материал всё ещё бумага, а опор по-прежнему две. Сравните обе модели: что изменилось у листа?',
    success: 'Вы решили задачу: изменили форму, не добавляя бумагу или опоры. Попробуйте эту идею в полной миссии.',
    noScript: 'Включите JavaScript, чтобы менять модель и проверять ответ. Иллюстрация не моделирует прочность бумаги.',
  },
} satisfies Record<Locale, object>;
