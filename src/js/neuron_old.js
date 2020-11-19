const N = [3];
/*
  Блок получения выборки данных за перод с 2016 по 2019 годы
*/
  let huntingResource_2016 = Object.values(hunt_2016[46]).filter( (value,indexValue) => indexValue>2  && indexValue != 29 ).map(value => Number(value)), // Получаем выборку по зайцам за 2016
      huntingResource_2017 = Object.values(hunt_2017[45]).filter( (value,indexValue) => indexValue>2  && indexValue != 29 ).map(value => Number(value)), // Получаем выборку по зайцам за 2017
      huntingResource_2018 = Object.values(hunt_2018[45]).filter( (value,indexValue) => indexValue>2  && indexValue != 29 ).map(value => Number(value)), // Получаем выборку по зайцам за 2018
      huntingResource_2019 = Object.values(hunt_2019[45]).filter( (value,indexValue) => indexValue>2  && indexValue != 29 ).map(value => Number(value)), // Получаем выборку по зайцам за 2019
/*
  END:Блок получения выборки данных за перод с 2016 по 2019 годы
*/
 areasName = Object.keys(hunt_2019[45]).filter( (value,indexValue) => indexValue>2 && indexValue != 29); // Получаем название районов
let L = N.length,  
  Ts = [],        //  Обучающая выборка (нормализованные данные)
  secondTs = [],  //  Обучающая выборка (исходные данные)
  classes = [],   //  Данные разбитые по классам
  colors = ["green","yellow","maroon","red","snow","purple","blue","lightGreen"]; // Цвета для возможных классов

function cArr() {
  /*
    Наполнение массива примеров обучающей выборки.
  */
  let sum2016 = 0, // Массив для суммы квадратов данных за 2016
      sum2017 = 0, // Массив для суммы квадратов данных за 2017
      sum2018 = 0, // Массив для суммы квадратов данных за 2018
      sum2019 = 0; // Массив для суммы квадратов данных за 2019
  for(let i=0;i<huntingResource_2016.length;i++) // Пробегаемся по всем примерам из обучающей выборки
  {   
    secondTs.push([huntingResource_2016[i],huntingResource_2017[i],huntingResource_2018[i],huntingResource_2019[i]]);   // Наполняем массив исходными значениями обучающей выборки
    sum2016 += huntingResource_2016[i]**2;  //  Суумирование вкадратов данных за 2016
    sum2017 += huntingResource_2017[i]**2;  //  Суумирование вкадратов данных за 2017
    sum2018 += huntingResource_2018[i]**2;  //  Суумирование вкадратов данных за 2018
    sum2019 += huntingResource_2019[i]**2;  //  Суумирование вкадратов данных за 2019
  }
  secondTs.forEach(  (value, indexValue ) => Ts.push( [value[0]/ Math.sqrt(sum2016),      //  Нормализация
                                                       value[1]/ Math.sqrt(sum2017),        //  данных
                                                       value[2]/ Math.sqrt(sum2018),          //  по каждому
                                                       value[3]/ Math.sqrt(sum2019)] ) )         //  году
  areasName.forEach( (value,indexValue) => {
    //  Формирование строки таблицы с данными по району
    let td = "<td>"+value+"</td> <td>"+secondTs[indexValue][0]+"</td> <td>"+secondTs[indexValue][1]+"</td> <td>"+secondTs[indexValue][2]+"</td> <td>"+secondTs[indexValue][3]+"</td>";
    document.querySelector(".visual tbody").innerHTML += "<tr class='area "+value+"'>"+td+"</tr>"; // Добавление строки в таблицу
  } )
  learn() 
}
function rnd(min, max) {
  /*
    Функция случайного числа в диапазоне min - max
    Аргументы:
    min : тип данных (вещественное) - от какого числа начинается диапазон случайных чисел
    max : тип данных (вещественное) - каким числом заканчивается диапазон случайных чисел
  */
  return min + Math.random() * (max - min);
}

class Neuron {
  /* 
    Класс одного нейрона. 
    Аргументы:
    w : тип данных (целое число) - количество синапсов у данного нейрона
  */
  constructor(w,a) // Инициализация переменных для нейрона
  {
    this.w = Array(w).fill(0).map((value, index) => rnd(0.05, 0.39)); // Инициализируем массив весовых коэффициентов
  }
}
// Создаем нейронную сеть из экемпляров класса Neuron
let neurons = Array(N.length).fill(0).map( (layer,indexLayer ) => { // Создаем N.length слоёв
      // Возвращаем слой с наполненным количеством N[indexLayer] нейронов
      return Array(N[indexLayer]).fill(0).map((neuron,ndexNeuron ) => { // Создаем N[indexLayer] нейронов в слое
            return new Neuron(indexLayer == 0 ? 4 : N[indexLayer - 1]); // Возвращаем экземпляр класса нового нейрона
          }
        );
    }
  );

function kohonen(a, w, y) {
  /*
    Функция минимизацы разниы между входными сигналами нейрона и его весовыми коэффициентами
    Аргументы:
    a : тип данных (вещественный) - скорость обучения нейронов
    w : тип данных (список) - весовые коэффициенты победившего нейрона
    y : тип данных (список) - входные данные для победившего нейрона
  */
  //Корректруем весовые коэффициенты согласно формуле
  w.forEach(
    (weight, indexWeight) => (w[indexWeight] += a * (y[indexWeight] - weight))
  );
}
function indexMinimum(D) {
  /*
    Функция определения минимального расcтояния между нейронами и входным воздействием
    Аргументы:
    D : тип данных (список) - значения полученные по формуле корня квадратного суммы квадрата разности
  */
  let index = 0,
    min = D[index]; // Устанавливаем первый жлемент списка как минимальный
  for (
    let i = 1;
    i < D.length;
    i++ //Пробегаемся по всем элементам кроме первого
  ) {
    if (D[i] < min) {
      // Если текущий элемент меньше предыдущего минимума
      index = i; // Тогда меняем индекс минимального элемента
      min = D[i]; // Изменяем значение минимального элемента
    }
  }
  return index; //Возвращаем индекс минимального элемента
}
function neuronWinner(y, layer = 0) {
  /*
    Функция определения нейрона победителя (ближайшего к входному воздействию)
    Аргументы:
    y     : тип данных (список) - входное воздействие
    layer : тип данных (целое) - номер слоя, по умолчанию первый слой
  */
  let D = []; //Список для хранения растояний между нейронами и входным воздействием
  neurons[layer].forEach((
    neuron,
    indexNeuron // Перебор всех нейронов
  ) => {
    let s = 0; // Инициализация переменной для суммирования
    y.forEach((
      input,
      indexInput // Перебор данных входного воздействия
    ) => {
      s += (input - neuron["w"][indexInput]) ** 2; // Суммирование разности квадратов
    });
    D.push(Math.sqrt(s)); // Добавление расстояния в список
  });
  return indexMinimum(D); // Возвращение индекса победившего нейрона
}

function layerTraining(a, x) {
  /*
    Процедура обучения нейрона в слое
    Аргументы:
    a     : тип данных (вещественное) - коэффициент скорость обучения
    x     : тип данных (список) - входное воздействие
  */
  let indexNeuron = neuronWinner(x); // Получение индекса победившего нейрона
  kohonen(a, neurons[0][indexNeuron]["w"], x); // Уменьшение расстояния между нейроном и входным воздействием
}

function belong(x, index, action = 1) {
  /*
    Процедура отнесения входного воздействия к соответствующему классу
    Аргументы:
    x      : тип данных (список) - входное воздействие
    index  : тип данных (целый)  - индекс победившего нейрона
    action : тип данных (целый)  - определение действия (1 - наполнение классов; 0 - очистка списка классов)
    
  */
  if (action) {
    // Если action == 1
    // Если классов нет, то создаем пустые списки по количество нуйронов в слое, иначе оставляем как есть
    classes = !classes.length ? neurons[0].map(value => []) : classes;
    let indexNeuron = neuronWinner(x); // Получаем индекс победившего нейрона
    classes[indexNeuron].push(secondTs[index][3]); // Добавляем индекс массы тела (не нормализованный) в соответствующий класс
  } else {
    // Иначе
    classes = neurons[0].map(value => []); // Очищаем классы
  }
}
function amountClasses() {
  /*
    Функция определения количества элементов в каждом классе
  */
  belong(0, 0, 0); // Очищаем классы
  Ts.forEach((value, indexValue) => belong(value, indexValue)); // Относим каждое входное воздействие в соответствующий класс
  return classes.map(value => value.length); // Возвращаем список состоящий из количества элементов в каждом клссе
}
function learn(action = 0, a = 0.3, b = 0.001, number = 10) {
  /*
    Процедру запуска алгоритма обучения нейронной сети
    Аргументы:
    action : тип данных (число) - если 0, тогда только отображает результат работы НС, иначе запускает обучение
    a      : тип данных (вещественный) - скорость обучения нейронов 
    b      : тип данных (вещественный) - темп сокращения скорости обучения
    number : тип данных (целый) - количество повторений на одном значении коэффициента a
  */
  if (action) {
    //Если action не равен нулю
    while (
      a > 0 // Повторяем пока a больше нуля
    ) {
      for (
        let i = 1;
        i < number;
        i++ //Пробегаемся по всем эпохам
      ) {
        // Перебираем все примеры из обучающей выборки, и подаем на вход функции hebba случайные значения из неё
        Ts.forEach((x, index) => {
          layerTraining(a, Ts[parseInt(Math.random() * Ts.length)]);
        });
      }
      a -= b; // Уменьшаем коэффициент скорости обучения
    }
  }

  /*
    Блок отрисовки результатов интерпритации НС (нейронной сети)
  */

  amountClasses(); //Наполняем массив классов
  let t = document.querySelectorAll(".area"), // Записываем в переменную t все строки таблицы
    classIndex = 0; // Индекс класс к которому пренадлежит маркируемая ячейка
  for (let row = 0;row < t.length;row++) // Перебираем все строки таблицы
   {
      colors.forEach(selector => t[row].classList.remove(selector)); //Очищаем все селекторы модификаторы
      classes.forEach((values, indexClass) =>
        values.forEach((value, indexValue) => {
          //Перебираем классы и все элементы в них
          if (value == secondTs[row][3]) {
                // Если хоть одно значение в классе совпадает с текущим индексом массы тела
                classIndex = indexClass; // Тогда присваиваем переменной classIndex индекс данного класса
              }
          })
      );
      answer(classIndex, row); // Закрашиваем ячейку
    
  }
  google.charts.setOnLoadCallback(drawChart); //Отображаем график
}
function answer(index, indexRow) {
  /*
    Процедура маркирующая ячейки соответствующим цветом в зависимости от класса
    Аргументы:
    index : тип данных (вещественный) - индекс класса
    x     : тип данных (целочисленный) - координата x ячейки
    y     : тип данных (целочисленный) - координата y ячейки
  */
  let row = document.querySelector("."+areasName[indexRow]); // Получаем строку
  row.classList.toggle(colors[index]); // Закрашиваем ячейку соответствующим цветом по номеру класса
}

google.charts.load("current", { packages: ["corechart"] });
function drawChart() {
  let results = [["Iteration", "Network response"]],
    indexTrain = 0;
  classes.forEach((value, indexValue) =>
    value.forEach((answer, indexAnswer) => {
      results.push([indexValue, answer]);
      indexTrain++;
    })
  );
  var data = google.visualization.arrayToDataTable(results);

  var options = {
    title: "Result",
    hAxis: { title: "Class" },
    vAxis: { title: "Value for 2016 year" },
    legend: "none"
  };

  var chart = new google.visualization.ScatterChart(
    document.querySelector(".network-answers")
  );

  chart.draw(data, options);
}
window.onload = () => {
  cArr();
}; //  Проведение инициализации и наполнения массива обучающей выборки при загрузке страницы
