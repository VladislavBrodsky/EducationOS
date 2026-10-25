import type { Metadata } from 'next';
import { localizedPath, type Locale } from './marketing-i18n';
import { SITE_URL } from './site';

export type DetailPage = 'programs' | 'approach' | 'trust';

type Stage = { name: string; ages: string; verb: string; description: string; activity: string };
type Step = { title: string; body: string };
type TrustCard = { title: string; body: string; href: string };
type DetailCopy = {
  shared: { demo: string; demoNote: string; englishOnly: string; readMore: string };
  programs: { title: string; description: string; kicker: string; stagesLabel: string; activityLabel: string; preview: string; stages: Stage[] };
  approach: { title: string; description: string; kicker: string; evidence: string; steps: Step[] };
  trust: { title: string; description: string; kicker: string; boundary: string; cards: TrustCard[] };
};

export const detailCopy: Record<Locale, DetailCopy> = {
  es: {
    shared: { demo: 'Probar la misión', demoNote: 'Demo en inglés · Sin cuenta · Sin datos personales', englishOnly: 'Información detallada en inglés', readMore: 'Leer más' },
    programs: {
      kicker: 'CINCO ETAPAS · UNA MENTE CURIOSA', title: 'Espacio para preguntar. Tiempo para crecer',
      description: 'De la primera pregunta a una idea puesta a prueba. Descubre cómo cambia una misma misión de invención según la edad',
      stagesLabel: 'Explora las etapas', activityLabel: 'UNA PREGUNTA PARA EXPLORAR',
      preview: 'Hoy puedes probar una misión de puente de papel adaptada por edades, sin crear una cuenta. Estas etapas son una guía de diseño, no programas acreditados ni promesas de resultados',
      stages: [
        { name: 'Exploradores', ages: '5–6', verb: 'Observar lo extraordinario', description: 'Jugar con formas, contar historias y hacer grandes preguntas con un adulto presente en cada experimento', activity: 'Crear un camino de papel para un juguete' },
        { name: 'Constructores', ages: '7–9', verb: 'Convertir ideas en cosas', description: 'Probar materiales cotidianos, comparar ideas y descubrir qué cambia al construir de otra manera', activity: 'Doblar un puente de papel más resistente' },
        { name: 'Inventores', ages: '10–12', verb: 'Poner a prueba una mejora', description: 'Encontrar una contradicción, diseñar una comparación justa y dejar que las observaciones orienten la siguiente versión', activity: 'Equilibrar resistencia y cantidad de material' },
        { name: 'Creadores', ages: '13–15', verb: 'Cuestionar la respuesta obvia', description: 'Trabajar con límites, revisar supuestos y explicar las decisiones detrás de un diseño', activity: 'Mejorar una estructura con recursos limitados' },
        { name: 'Impulsores', ages: '16–17', verb: 'Dar propósito a una idea', description: 'Definir un problema útil, evaluar la evidencia y comunicar una decisión de diseño razonada', activity: 'Proponer una estructura que use poco material' },
      ],
    },
    approach: {
      kicker: 'NUESTRO MÉTODO', title: 'Aprender a pensar. Abrir un mundo de ideas',
      description: 'Un ciclo guiado de preguntas, posibilidades y observaciones reales, inspirado en TRIZ y adaptado a la exploración práctica',
      evidence: 'Evidencia antes que puntuaciones: el portafolio de la demo muestra las ideas y observaciones que registras. No deduce inteligencia, diagnostica necesidades de aprendizaje ni afirma dominio por completar una actividad. El currículo y la adecuación por edades requieren revisión docente antes de abrir el acceso a estudiantes reales',
      steps: [
        { title: 'Observar', body: 'Mirar con atención antes de resolver. Describe qué pasa con la primera versión del puente de papel' },
        { title: 'Encontrar una contradicción', body: 'Queremos un puente más resistente usando la misma hoja. Esa tensión da una dirección a la invención' },
        { title: 'Imaginar posibilidades', body: 'Dibujar o describir varias ideas. Cambiar la forma y reorganizar el mismo material' },
        { title: 'Formular una hipótesis', body: 'Elegir una idea y hacer una predicción comprobable. Explicar por qué podría funcionar' },
        { title: 'Hacer una prueba justa', body: 'Comparar la primera estructura con la nueva. Mantener las condiciones y anotar lo observado' },
        { title: 'Reflexionar sobre la evidencia', body: '¿Coincidió el resultado con la predicción? Una sorpresa invita a pensar de nuevo' },
        { title: 'Trasladar la idea', body: 'Buscar otro lugar donde sirva el mismo principio. Terminar con una nueva pregunta' },
      ],
    },
    trust: {
      kicker: 'CONFIANZA EN EDUCATIONOS', title: 'Curiosidad con límites claros',
      description: 'Las familias deben poder entender cómo funciona la experiencia, qué guarda y cuáles son sus límites',
      boundary: 'Estado de la versión: esta es una demostración pública, no un servicio aprobado para inscribir estudiantes reales, evaluar capacidades, atender emergencias ni realizar experimentos sin supervisión',
      cards: [
        { title: 'Una demo acotada', body: 'No hay cuentas ni perfiles infantiles. Puedes probarla sin nombre, correo, escuela, foto ni fecha de nacimiento', href: '/safety' },
        { title: 'Evidencia visible', body: 'El portafolio muestra las observaciones registradas en la misión. El progreso refleja evidencia completada, no una puntuación de capacidad inventada', href: '/demo/portfolio' },
        { title: 'Perspectiva para adultos', body: 'La vista para tutores muestra evidencias y preguntas para conversar. Es una vista previa, no un proceso de consentimiento', href: '/demo/guardian' },
        { title: 'Privacidad desde el diseño', body: 'El trabajo de la demo permanece en el almacenamiento de sesión de esta pestaña. No hay anuncios, analítica de seguimiento, publicación pública ni chat de IA abierto', href: '/privacy' },
        { title: 'Materiales sencillos', body: 'La misión del puente usa materiales comunes e incluye indicaciones para adultos. Mantén los objetos pequeños lejos de niños pequeños', href: '/safety' },
        { title: 'Un punto de partida honesto', body: 'La inscripción real sigue cerrada. Identidad, consentimiento, revisión legal y curricular y pruebas operativas son requisitos previos', href: '/terms' },
      ],
    },
  },
  en: {
    shared: { demo: 'Try the mission', demoNote: 'English demo · No account · No personal details', englishOnly: 'Detailed information in English', readMore: 'Learn more' },
    programs: {
      kicker: 'FIVE STAGES · ONE CURIOUS MIND', title: 'Room to wonder. Space to become',
      description: 'From a first “why?” to a carefully tested idea. See how one invention mission changes with a learner’s stage',
      stagesLabel: 'Explore the stages', activityLabel: 'A QUESTION TO EXPLORE',
      preview: 'Today you can try an age-adapted paper bridge mission without an account. These stages guide the experience; they are not accredited programs or promises of learning outcomes',
      stages: [
        { name: 'Explorers', ages: '5–6', verb: 'Notice the extraordinary', description: 'Play with shapes, tell stories, and ask big questions with an adult joining every experiment', activity: 'Make a paper path for a toy' },
        { name: 'Builders', ages: '7–9', verb: 'Turn a thought into a thing', description: 'Try everyday materials, compare ideas, and discover what changes when you build differently', activity: 'Fold a stronger paper bridge' },
        { name: 'Makers', ages: '10–12', verb: 'Test what could be better', description: 'Spot a contradiction, design a fair test, and let observations guide the next version', activity: 'Balance strength and material use' },
        { name: 'Creators', ages: '13–15', verb: 'Question the obvious answer', description: 'Work with constraints, challenge assumptions, and explain the tradeoffs behind a design', activity: 'Optimize a structure under constraints' },
        { name: 'Launchers', ages: '16–17', verb: 'Give an idea a purpose', description: 'Frame a useful problem, evaluate evidence, and communicate a thoughtful design decision', activity: 'Propose a low-material structural system' },
      ],
    },
    approach: {
      kicker: 'OUR LEARNING APPROACH', title: 'Teach a way of thinking. Open a world of ideas',
      description: 'A guided cycle of questions, possibilities, and real observations, inspired by TRIZ and adapted for hands-on exploration',
      evidence: 'Evidence over scores: the demo portfolio shows ideas and observations you actually record. It does not infer intelligence, diagnose learning needs, or claim mastery from a completed activity. Curriculum and age suitability require educator review before real learner access opens',
      steps: [
        { title: 'Notice', body: 'Look closely before solving. Describe what happens with the first version of your paper bridge' },
        { title: 'Find a contradiction', body: 'We want a stronger bridge with the same sheet of paper. That tension gives invention a direction' },
        { title: 'Imagine possibilities', body: 'Sketch or describe different ideas. Change the shape and rearrange the same material' },
        { title: 'Form a hypothesis', body: 'Choose one idea and make a prediction you can test. Explain why it might work' },
        { title: 'Run a fair experiment', body: 'Compare your first structure with the new one. Keep conditions steady and record what you observe' },
        { title: 'Reflect on the evidence', body: 'Did the result fit your prediction? A surprising result is a reason to think again' },
        { title: 'Transfer the idea', body: 'Find another place where the same principle might help. End with a new question' },
      ],
    },
    trust: {
      kicker: 'THE EDUCATIONOS TRUST CENTER', title: 'Built around curiosity. Grounded in care',
      description: 'Families should be able to understand how an experience works, what it collects, and where its limits are',
      boundary: 'Release status: this is a public demonstration, not a service approved for real learner enrollment, ability assessment, emergency support, or unsupervised experiments',
      cards: [
        { title: 'A bounded demo', body: 'No accounts or child profiles. Try the demo without a name, email, school, photo, or date of birth', href: '/safety' },
        { title: 'Evidence you can see', body: 'The portfolio displays observations entered during the mission. Progress means completed evidence, not an invented ability score', href: '/demo/portfolio' },
        { title: 'An adult’s perspective', body: 'The guardian preview shows learning evidence and conversation prompts. It is a preview, not a consent process', href: '/demo/guardian' },
        { title: 'Privacy by design', body: 'Demo work stays in this tab’s session storage. No advertising, tracking analytics, public sharing, or open AI chat is integrated', href: '/privacy' },
        { title: 'Ordinary materials', body: 'The paper bridge mission uses simple materials and adult guidance. Keep small objects away from young children', href: '/safety' },
        { title: 'An honest starting point', body: 'Real enrollment remains closed. Identity, consent, legal and curriculum review, and operational testing are launch requirements', href: '/terms' },
      ],
    },
  },
  ru: {
    shared: { demo: 'Попробовать задание', demoNote: 'Демо на английском · Без аккаунта · Без личных данных', englishOnly: 'Подробная информация на английском', readMore: 'Подробнее' },
    programs: {
      kicker: 'ПЯТЬ ЭТАПОВ · ОДНО ЛЮБОПЫТСТВО', title: 'Пространство для вопросов. Время расти',
      description: 'От первого «почему?» до проверенной идеи. Посмотрите, как одно задание меняется с возрастом ученика',
      stagesLabel: 'Этапы обучения', activityLabel: 'ВОПРОС ДЛЯ ИССЛЕДОВАНИЯ',
      preview: 'Сейчас можно попробовать задание с бумажным мостом для разных возрастов без регистрации. Эти этапы помогают строить опыт; они не являются аккредитованными программами и не обещают результатов',
      stages: [
        { name: 'Исследователи', ages: '5–6', verb: 'Замечать необычное', description: 'Играть с формами, рассказывать истории и задавать важные вопросы вместе со взрослым на каждом опыте', activity: 'Сделать бумажную дорожку для игрушки' },
        { name: 'Строители', ages: '7–9', verb: 'Превращать мысль в вещь', description: 'Пробовать обычные материалы, сравнивать идеи и смотреть, что меняется при другой конструкции', activity: 'Сложить более прочный бумажный мост' },
        { name: 'Изобретатели', ages: '10–12', verb: 'Проверять улучшения', description: 'Замечать противоречия, проводить честное сравнение и улучшать следующую версию по наблюдениям', activity: 'Найти баланс между прочностью и расходом материала' },
        { name: 'Создатели', ages: '13–15', verb: 'Сомневаться в очевидном ответе', description: 'Работать с ограничениями, проверять предположения и объяснять выбор конструкции', activity: 'Улучшить конструкцию при ограниченных ресурсах' },
        { name: 'Новаторы', ages: '16–17', verb: 'Придавать идее смысл', description: 'Определять полезную задачу, оценивать данные и обосновывать проектное решение', activity: 'Предложить конструкцию с небольшим расходом материала' },
      ],
    },
    approach: {
      kicker: 'НАШ ПОДХОД К ОБУЧЕНИЮ', title: 'Учиться мыслить. Открывать мир идей',
      description: 'Путь от вопросов к разным решениям и настоящим наблюдениям, вдохновлённый ТРИЗ и практическими опытами',
      evidence: 'Наблюдения важнее баллов: в портфолио демоверсии показаны идеи и результаты, которые вы записали. Оно не определяет интеллект, не диагностирует трудности и не утверждает, что задание доказывает освоение навыка. Перед открытием доступа реальным ученикам программу и возрастную уместность должны проверить педагоги',
      steps: [
        { title: 'Наблюдать', body: 'Сначала внимательно посмотреть. Описать, как работает первая версия бумажного моста' },
        { title: 'Найти противоречие', body: 'Нужен более прочный мост из того же листа. Это противоречие подсказывает направление поиска' },
        { title: 'Представить варианты', body: 'Нарисовать или описать разные идеи. Изменить форму и по-новому расположить тот же материал' },
        { title: 'Сформулировать гипотезу', body: 'Выбрать идею и сделать проверяемый прогноз. Объяснить, почему она может сработать' },
        { title: 'Провести честный опыт', body: 'Сравнить первую и новую конструкции при одинаковых условиях и записать наблюдения' },
        { title: 'Осмыслить результат', body: 'Совпал ли результат с прогнозом? Неожиданность — повод подумать ещё раз' },
        { title: 'Перенести идею', body: 'Найти другое место, где тот же принцип поможет. Завершить новым вопросом' },
      ],
    },
    trust: {
      kicker: 'ДОВЕРИЕ К EDUCATIONOS', title: 'Любопытство в безопасных границах',
      description: 'Семья должна понимать, как устроен опыт, что он сохраняет и где проходят его границы',
      boundary: 'Статус версии: это открытая демоверсия, не сервис для регистрации настоящих учеников, оценки способностей, экстренной помощи или опытов без присмотра',
      cards: [
        { title: 'Ограниченная демоверсия', body: 'Нет аккаунтов и детских профилей. Для знакомства не нужны имя, почта, школа, фото или дата рождения', href: '/safety' },
        { title: 'Наблюдаемые результаты', body: 'Портфолио показывает записи из задания. Прогресс означает наличие записанного результата, а не выдуманный балл способностей', href: '/demo/portfolio' },
        { title: 'Взгляд взрослого', body: 'Обзор для взрослых показывает записи и вопросы для беседы. Это предварительный пример, а не процедура согласия', href: '/demo/guardian' },
        { title: 'Приватность по замыслу', body: 'Данные демо остаются в хранилище этой вкладки. Нет рекламы, отслеживающей аналитики, публичных публикаций и открытого ИИ-чата', href: '/privacy' },
        { title: 'Простые материалы', body: 'Для бумажного моста нужны обычные материалы и помощь взрослого. Держите мелкие предметы подальше от маленьких детей', href: '/safety' },
        { title: 'Честное начало', body: 'Регистрация реальных учеников закрыта. Сначала нужны проверка личности и согласия, юридическая и педагогическая экспертиза и эксплуатационные испытания', href: '/terms' },
      ],
    },
  },
};

export function detailMetadata(locale: Locale, page: DetailPage): Metadata {
  const content = detailCopy[locale][page];
  const path = localizedPath(locale, page);
  const languages = { es: localizedPath('es', page), en: localizedPath('en', page), ru: localizedPath('ru', page), 'x-default': localizedPath('es', page) };
  return {
    title: content.title,
    description: content.description,
    alternates: { canonical: path, languages },
    openGraph: { locale: locale === 'es' ? 'es_MX' : locale === 'en' ? 'en_US' : 'ru_RU', url: `${SITE_URL}${path}`, title: content.title, description: content.description },
  };
}
