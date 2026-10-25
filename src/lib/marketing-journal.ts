import type { Locale } from './marketing-i18n';

type Article = {
  slug: string;
  category: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  minutes: number;
  sections: { heading: string; paragraphs: string[] }[];
  challenge: { question: string; material: string; action: string };
};

const images = {
  physics: '/images/physics-cutout.webp',
  math: '/images/math-cutout.webp',
  flight: '/images/flight-cutout.webp',
  code: '/images/code-cutout.webp',
};

export const marketingJournal: Record<Locale, Article[]> = {
  es: [
    { slug: 'see-the-invisible', category: 'CIENCIA', title: '¿Cómo vemos lo que no podemos tocar?', description: 'Una forma de hablar sobre movimiento y gravedad a partir de lo que podemos observar', image: images.physics, imageAlt: 'Ilustración de un estudiante explorando la Tierra y las órbitas', minutes: 4, sections: [
      { heading: 'Empezar con una pregunta', paragraphs: ['¿Por qué cae una pelota? ¿Por qué cambia una sombra? Una buena exploración empieza con algo que podemos notar, no con una fórmula para memorizar.', 'Pregunten qué podría ocurrir, hagan una prueba sencilla y describan lo que cambió. Un dibujo o unas pocas palabras ayudan a registrar la observación.'] },
      { heading: 'Un modelo ayuda a pensar', paragraphs: ['Una línea de puntos puede mostrar dónde estuvo una pelota en distintos momentos. Todo modelo simplifica la realidad: ¿qué cosas deja fuera nuestro dibujo? Esa pregunta también es aprendizaje.'] },
    ], challenge: { question: '¿Qué pelota llegará más lejos?', material: 'Dos pelotas ligeras, un libro y una superficie plana', action: 'Dejen rodar cada pelota desde el mismo punto de un libro ligeramente inclinado. Comparen dónde se detienen y cambien una sola cosa.' } },
    { slug: 'math-you-can-move', category: 'MATEMÁTICAS', title: 'Matemáticas que se pueden girar y doblar', description: 'La geometría cobra vida cuando podemos cambiar el punto de vista', image: images.math, imageAlt: 'Ilustración de un estudiante explorando sólidos geométricos', minutes: 3, sections: [
      { heading: 'Dejar que una forma se mueva', paragraphs: ['Un cuadrado sigue siendo un cuadrado al girar la hoja. Dos mitades iguales pueden verse diferentes y ocupar la misma superficie.', 'Dibujen una figura, recórtenla con ayuda de un adulto y gírenla sin estirarla. ¿Qué cambió y qué siguió igual?'] },
      { heading: 'Pedir una explicación', paragraphs: ['Una respuesta correcta es solo el comienzo. Cuando alguien explica por qué dos partes son iguales, podemos entender cómo pensó y qué conviene probar después.'] },
    ], challenge: { question: '¿Pueden dos formas distintas mostrar la misma mitad?', material: 'Papel, lápiz y tijeras infantiles con supervisión', action: 'Doblen un cuadrado de papel por la mitad de dos formas diferentes. Comparen las piezas.' } },
    { slug: 'paper-glider-experiment', category: 'DISEÑO Y CIENCIA', title: 'Un avión de papel puede ser un experimento', description: 'Cambiar un detalle, comparar vuelos y dejar que la evidencia guíe el siguiente diseño', image: images.flight, imageAlt: 'Ilustración de un estudiante estudiando un planeador de papel', minutes: 4, sections: [
      { heading: 'Construir dos versiones', paragraphs: ['Doblen dos planeadores con el mismo tipo de papel. Cambien una sola ala en uno de ellos. Antes de lanzarlos, hagan una predicción y expliquen por qué.', 'Láncenlos suavemente desde el mismo lugar, con una persona adulta supervisando y el espacio despejado.'] },
      { heading: 'Observar antes de decidir', paragraphs: ['Una corriente de aire o una forma distinta de lanzar puede cambiar el resultado. Repitan la prueba varias veces y comparen lo que pasó.'] },
    ], challenge: { question: '¿Qué pasa si cambia un ala?', material: 'Dos hojas de papel y un espacio despejado', action: 'Doblen dos planeadores iguales, cambien un ala de uno, predigan y repitan el vuelo desde el mismo sitio.' } },
    { slug: 'program-a-paper-robot', category: 'PROGRAMACIÓN', title: '¿Puedes programar un robot de papel?', description: 'Una forma divertida de descubrir algoritmos, ciclos y errores sin pantalla', image: images.code, imageAlt: 'Ilustración de un estudiante explorando un flujo de programación', minutes: 3, sections: [
      { heading: 'Dar una instrucción pequeña', paragraphs: ['Un algoritmo es una secuencia de instrucciones. Una persona escribe los pasos; otra mueve un lápiz por una cuadrícula siguiendo exactamente lo escrito.', 'Empiecen con órdenes sencillas: avanza una casilla, gira a la derecha y detente. Comparen el camino imaginado con el camino dibujado.'] },
      { heading: 'Encontrar el ciclo', paragraphs: ['Si los mismos pasos se repiten, encontraron un ciclo. Cuatro repeticiones de «avanza una casilla y gira a la derecha» pueden dibujar un cuadrado. Si sale algo distinto, revisen una instrucción a la vez.'] },
    ], challenge: { question: '¿Tus instrucciones dibujan un cuadrado?', material: 'Papel cuadriculado, lápiz y otra persona', action: 'Escriban «avanza una casilla, gira a la derecha» cuatro veces. Sigan los pasos y corrijan cualquier sorpresa.' } },
  ],
  en: [
    { slug: 'see-the-invisible', category: 'SCIENCE', title: 'How can we see what we cannot touch?', description: 'A way to discuss motion and gravity through things we can observe', image: images.physics, imageAlt: 'Concept artwork of a learner exploring Earth and orbits', minutes: 4, sections: [
      { heading: 'Start with a question', paragraphs: ['Why does a ball fall? Why does a shadow move? A useful exploration begins with something we can notice, not a formula to memorize.', 'Predict what might happen, try a simple test, then describe what changed. A drawing or a few words can record the observation.'] },
      { heading: 'A model helps us think', paragraphs: ['A line of dots can show where a ball was at different moments. Every model simplifies reality. What does our drawing leave out? That question is part of learning, too.'] },
    ], challenge: { question: 'Which ball will travel farther?', material: 'Two lightweight balls, a book, and a flat surface', action: 'Roll each ball from the same point on a gently tilted book. Compare where they stop, then change one thing.' } },
    { slug: 'math-you-can-move', category: 'MATHEMATICS', title: 'Math you can turn and fold', description: 'Geometry comes alive when a learner can change the view', image: images.math, imageAlt: 'Concept artwork of a learner exploring geometric solids', minutes: 3, sections: [
      { heading: 'Let a shape move', paragraphs: ['A square stays a square when we rotate the page. Two equal halves may look different yet cover the same area.', 'Draw a shape, cut it out with adult help, and turn it without stretching it. What changed and what stayed the same?'] },
      { heading: 'Ask for an explanation', paragraphs: ['A correct choice is only the beginning. When someone explains why two parts are equal, we can understand their reasoning and decide what to test next.'] },
    ], challenge: { question: 'Can two different shapes show the same half?', material: 'Paper, a pencil, and child-safe scissors with supervision', action: 'Fold a paper square in half two different ways. Compare the pieces.' } },
    { slug: 'paper-glider-experiment', category: 'DESIGN & SCIENCE', title: 'A paper glider can become an experiment', description: 'Change one detail, compare flights, and let evidence guide the next design', image: images.flight, imageAlt: 'Concept artwork of a learner studying a paper glider', minutes: 4, sections: [
      { heading: 'Build two versions', paragraphs: ['Fold two gliders from the same kind of paper. Change just one wing on one of them. Before launching, predict what will happen and explain why.', 'Launch gently from the same place, with an adult supervising and the space clear.'] },
      { heading: 'Notice before deciding', paragraphs: ['A breeze or a different throw can change the result. Repeat the test several times and compare what happened.'] },
    ], challenge: { question: 'What happens when one wing changes?', material: 'Two sheets of paper and a clear space', action: 'Fold two matching gliders, change one wing on one, predict, and repeat the flight from the same spot.' } },
    { slug: 'program-a-paper-robot', category: 'PROGRAMMING', title: 'Can you program a paper robot?', description: 'Discover algorithms, loops, and debugging without a screen', image: images.code, imageAlt: 'Concept artwork of a learner exploring a programming flow', minutes: 3, sections: [
      { heading: 'Give a tiny instruction', paragraphs: ['An algorithm is a sequence of instructions. One person writes steps; another moves a pencil across a grid by following exactly what was written.', 'Start with small commands: move one square, turn right, and stop. Compare the imagined path with the drawn one.'] },
      { heading: 'Find the loop', paragraphs: ['When the same steps repeat, you have found a loop. Four repetitions of “move one square and turn right” can draw a square. If the result surprises you, inspect one instruction at a time.'] },
    ], challenge: { question: 'Can your instructions draw a square?', material: 'Grid paper, a pencil, and a partner', action: 'Write “move one square, turn right” four times. Follow the steps and edit any surprises.' } },
  ],
  ru: [
    { slug: 'see-the-invisible', category: 'НАУКА', title: 'Как увидеть то, что нельзя потрогать?', description: 'Обсуждаем движение и гравитацию через то, что можно наблюдать', image: images.physics, imageAlt: 'Иллюстрация ученика, изучающего Землю и орбиты', minutes: 4, sections: [
      { heading: 'Начать с вопроса', paragraphs: ['Почему падает мяч? Почему движется тень? Хорошее исследование начинается с наблюдения, а не с формулы для заучивания.', 'Предположите, что случится, проведите простую проверку и опишите изменения. Рисунок или несколько слов помогут сохранить наблюдение.'] },
      { heading: 'Модель помогает думать', paragraphs: ['Линия точек покажет, где находился мяч в разные моменты. Любая модель упрощает реальность. Чего не хватает на нашем рисунке? Это тоже важный вопрос.'] },
    ], challenge: { question: 'Какой мяч укатится дальше?', material: 'Два лёгких мяча, книга и ровная поверхность', action: 'Пустите каждый мяч с одной и той же точки по слегка наклонённой книге. Сравните результат, затем измените одну деталь.' } },
    { slug: 'math-you-can-move', category: 'МАТЕМАТИКА', title: 'Математика, которую можно крутить и сгибать', description: 'Геометрия оживает, когда можно посмотреть на фигуру по-новому', image: images.math, imageAlt: 'Иллюстрация ученика, изучающего геометрические тела', minutes: 3, sections: [
      { heading: 'Дать фигуре движение', paragraphs: ['Квадрат остаётся квадратом, если повернуть лист. Две равные половины могут выглядеть по-разному и занимать одинаковую площадь.', 'Нарисуйте фигуру, вырежьте её с помощью взрослого и поверните. Что изменилось, а что осталось прежним?'] },
      { heading: 'Попросить объяснить', paragraphs: ['Верный ответ — только начало. Объяснение покажет, как человек рассуждал и что стоит проверить дальше.'] },
    ], challenge: { question: 'Могут ли разные фигуры показывать одну половину?', material: 'Бумага, карандаш и безопасные ножницы под присмотром', action: 'Сложите бумажный квадрат пополам двумя способами. Сравните части.' } },
    { slug: 'paper-glider-experiment', category: 'ДИЗАЙН И НАУКА', title: 'Бумажный самолёт как эксперимент', description: 'Меняем одну деталь, сравниваем полёты и улучшаем конструкцию', image: images.flight, imageAlt: 'Иллюстрация ученика с бумажным самолётом', minutes: 4, sections: [
      { heading: 'Сделать две версии', paragraphs: ['Сложите два самолёта из одинаковой бумаги. Измените одно крыло только у одного. Перед запуском предположите, что произойдёт и почему.', 'Запускайте осторожно из одного места, под присмотром взрослого и в свободном пространстве.'] },
      { heading: 'Сначала наблюдать', paragraphs: ['Сквозняк или другой бросок могут изменить результат. Повторите опыт несколько раз и сравните полёты.'] },
    ], challenge: { question: 'Что изменится, если поменять одно крыло?', material: 'Два листа бумаги и свободное пространство', action: 'Сложите одинаковые самолёты, измените одно крыло, сделайте прогноз и несколько раз запустите их из одного места.' } },
    { slug: 'program-a-paper-robot', category: 'ПРОГРАММИРОВАНИЕ', title: 'Можно ли запрограммировать бумажного робота?', description: 'Изучаем алгоритмы, циклы и ошибки без экрана', image: images.code, imageAlt: 'Иллюстрация ученика, изучающего схему программы', minutes: 3, sections: [
      { heading: 'Дать короткую команду', paragraphs: ['Алгоритм — это последовательность инструкций. Один человек пишет шаги, а другой ведёт карандаш по клеткам, точно следуя написанному.', 'Начните с простых команд: пройти одну клетку, повернуть направо и остановиться. Сравните задуманный путь с нарисованным.'] },
      { heading: 'Найти цикл', paragraphs: ['Когда действия повторяются, вы нашли цикл. Четыре повтора команды «пройти одну клетку и повернуть направо» могут нарисовать квадрат. Если результат удивил, проверяйте инструкции по одной.'] },
    ], challenge: { question: 'Нарисуют ли ваши команды квадрат?', material: 'Бумага в клетку, карандаш и партнёр', action: 'Четыре раза запишите «пройди одну клетку, поверни направо». Выполните команды и исправьте неожиданности.' } },
  ],
};

export function getMarketingArticle(locale: Locale, slug: string) {
  return marketingJournal[locale].find(article => article.slug === slug);
}
