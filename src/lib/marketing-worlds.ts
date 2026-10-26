import type { Locale } from './marketing-i18n';

export const visualWorlds = [
  { id: 'programming', image: '/images/world-ar-programming.webp' },
  { id: 'investing', image: '/images/world-ar-investing.webp' },
  { id: 'anatomy', image: '/images/world-ar-anatomy.webp' },
  { id: 'ocean', image: '/images/world-ar-ocean.webp' },
  { id: 'aviation', image: '/images/world-ar-aviation.webp' },
  { id: 'marketing', image: '/images/world-ar-marketing.webp' },
  { id: 'business', image: '/images/world-ar-business.webp' },
  { id: 'languages', image: '/images/world-ar-languages.webp' },
] as const;

type WorldId = (typeof visualWorlds)[number]['id'];
type WorldText = { label: string; question: string; detail: string; alt: string };
type WorldCopy = { kicker: string; title: string; introduction: string; choose: string; concept: string; demoLink: string; subjects: Record<WorldId, WorldText> };

export const visualWorldCopy: Record<Locale, WorldCopy> = {
  es: {
    kicker: 'IMAGINAR OTRAS FORMAS DE APRENDER', title: 'Ver una idea desde dentro',
    introduction: 'Explora cómo las gafas de realidad aumentada podrían hacer visibles ideas complejas en distintos campos',
    choose: 'Elige un tema para explorar', concept: 'Concepto visual · Las gafas AR no están disponibles en la demo', demoLink: 'Probar una misión real',
    subjects: {
      programming: { label: 'Programación', question: '¿Qué ocurre dentro de un bucle?', detail: 'Sigue una secuencia, cambia una regla y observa el resultado', alt: 'Estudiante con gafas AR explora un bucle visual junto a un robot' },
      investing: { label: 'Inversión', question: '¿Cómo se comparan riesgo y tiempo?', detail: 'Compara decisiones simuladas y posibles resultados, sin dinero real', alt: 'Estudiante con gafas AR compara modelos visuales de inversión y riesgo' },
      anatomy: { label: 'Anatomía', question: '¿Cómo circula la sangre por el corazón?', detail: 'Explora un modelo anatómico y sigue las rutas del flujo', alt: 'Estudiante con gafas AR observa un modelo tridimensional del corazón' },
      ocean: { label: 'Océanos', question: '¿Qué conecta a los habitantes de un arrecife?', detail: 'Investiga relaciones entre especies, hábitats y agua', alt: 'Estudiante con gafas AR explora un arrecife y su red de vida' },
      aviation: { label: 'Aviación', question: '¿Por qué cambia el vuelo de un ala?', detail: 'Compara formas y trayectorias antes de probar un planeador', alt: 'Estudiante con gafas AR estudia el flujo del aire alrededor de un ala' },
      marketing: { label: 'Marketing', question: '¿Cómo llega una idea a una comunidad?', detail: 'Compara mensajes para una campaña de plantación local', alt: 'Estudiante con gafas AR compara dos carteles de una campaña comunitaria' },
      business: { label: 'Negocios', question: '¿Cómo se convierte una idea en algo útil?', detail: 'Conecta una necesidad real con materiales, prototipos y personas', alt: 'Estudiante con gafas AR visualiza el desarrollo de un organizador reciclado' },
      languages: { label: 'Idiomas', question: '¿Cómo damos sentido a nuevas palabras?', detail: 'Relaciona objetos, sonidos y conversaciones', alt: 'Dos estudiantes con gafas AR conversan con ayudas visuales sobre objetos' },
    },
  },
  en: {
    kicker: 'IMAGINE NEW WAYS TO LEARN', title: 'See an idea from the inside',
    introduction: 'Explore how augmented-reality glasses could make complex ideas visible across subjects',
    choose: 'Choose a subject to explore', concept: 'Visual concept · AR glasses are not available in the demo', demoLink: 'Try a real mission',
    subjects: {
      programming: { label: 'Programming', question: 'What happens inside a loop?', detail: 'Follow a sequence, change a rule, and notice the result', alt: 'Learner with AR glasses explores a visual loop beside a robot' },
      investing: { label: 'Investing', question: 'How do risk and time compare?', detail: 'Compare simulated choices and possible outcomes, without real money', alt: 'Learner with AR glasses compares visual models of investing and risk' },
      anatomy: { label: 'Anatomy', question: 'How does blood move through the heart?', detail: 'Explore an anatomical model and trace its flow paths', alt: 'Learner with AR glasses studies a three-dimensional heart model' },
      ocean: { label: 'Oceans', question: 'What connects life on a reef?', detail: 'Investigate relationships among species, habitats, and water', alt: 'Learner with AR glasses explores a reef and its web of life' },
      aviation: { label: 'Aviation', question: 'Why does a wing fly differently?', detail: 'Compare shapes and paths before testing a glider', alt: 'Learner with AR glasses studies airflow around a wing' },
      marketing: { label: 'Marketing', question: 'How does an idea reach a community?', detail: 'Compare messages for a local tree-planting campaign', alt: 'Learner with AR glasses compares two community campaign posters' },
      business: { label: 'Business', question: 'How does an idea become useful?', detail: 'Connect a real need with materials, prototypes, and people', alt: 'Learner with AR glasses visualizes a recycled organizer project' },
      languages: { label: 'Languages', question: 'How do new words gain meaning?', detail: 'Connect objects, sounds, and conversations', alt: 'Two learners with AR glasses converse with visual object cues' },
    },
  },
  ru: {
    kicker: 'ПРЕДСТАВИМ НОВЫЕ СПОСОБЫ УЧИТЬСЯ', title: 'Заглянуть внутрь идеи',
    introduction: 'Посмотрите, как очки дополненной реальности могли бы помочь увидеть сложные понятия в разных областях',
    choose: 'Выберите тему', concept: 'Визуальная концепция · AR-очки пока недоступны в демоверсии', demoLink: 'Попробовать настоящее задание',
    subjects: {
      programming: { label: 'Программирование', question: 'Что происходит внутри цикла?', detail: 'Проследите последовательность, измените правило и сравните результат', alt: 'Ученик в AR-очках изучает визуальный цикл рядом с роботом' },
      investing: { label: 'Инвестиции', question: 'Как связаны риск и время?', detail: 'Сравните вымышленные решения и возможные исходы без реальных денег', alt: 'Ученик в AR-очках сравнивает визуальные модели инвестиций и риска' },
      anatomy: { label: 'Анатомия', question: 'Как кровь проходит через сердце?', detail: 'Рассмотрите анатомическую модель и проследите путь кровотока', alt: 'Ученица в AR-очках изучает трёхмерную модель сердца' },
      ocean: { label: 'Океаны', question: 'Что связывает обитателей рифа?', detail: 'Исследуйте связи между видами, средой обитания и водой', alt: 'Ученица в AR-очках исследует коралловый риф и его обитателей' },
      aviation: { label: 'Авиация', question: 'Почему крыло меняет полёт?', detail: 'Сравните формы и траектории перед испытанием планера', alt: 'Ученик в AR-очках изучает потоки воздуха вокруг крыла' },
      marketing: { label: 'Маркетинг', question: 'Как рассказать сообществу об идее?', detail: 'Сравните сообщения для местной акции по посадке деревьев', alt: 'Ученица в AR-очках сравнивает плакаты общественной акции' },
      business: { label: 'Бизнес', question: 'Как идея становится полезной?', detail: 'Свяжите реальную потребность с материалами, прототипом и людьми', alt: 'Ученик в AR-очках изучает проект органайзера из вторсырья' },
      languages: { label: 'Языки', question: 'Как новые слова обретают смысл?', detail: 'Свяжите предметы, звуки и разговор', alt: 'Двое учеников в AR-очках общаются с визуальными подсказками' },
    },
  },
};
