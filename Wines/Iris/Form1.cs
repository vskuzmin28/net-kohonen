﻿using System.Collections.Generic;
using System.IO;
using System.Windows.Forms;
using System.Globalization;
using System;

namespace Wines
{
    public partial class Form1 : Form
    {
        // Информация о винах
        // 3 класса вина
        // 0 - столовые вина
        // 1 - десертные вина
        // 2 - десертные крепкие вина
        private List<double[]> data;
        // Информация к какому классу относится вино
        private List<int> target;

        // Матрица весов
        private double[,] w;
        // Нейронов на входе
        private int n;
        // Нейронов на выходе
        private int m;
        // Для проверки было ли проведено обучение сети или нет
        private bool check; 

        public Form1()
        {
            InitializeComponent();

            // Начальная инициализация
            data = new List<double[]>();
            target = new List<int>();

            // Структура сети
            // Кол-во признаков (характеристик)
            n = 4;
            // Количество классов
            m = 3;
            // 4 нейрона на входе и 3 на выходе
            w = new double[n, m];

            // Получаем данные из файлов
            // _data - описание оценок
            // _target - описание классов
            using (StreamReader rd = new StreamReader("wines_data.txt"))
            {
                string line;
                while ((line = rd.ReadLine()) != null)
                {
                    string[] lines = line.Split(new char[1] { ' ' });
                    if (lines.Length != n) break;

                    data.Add(new double[lines.Length]);
                    for (int i = 0; i < lines.Length; i++)
                    {
                        data[data.Count - 1][i] = double.Parse(lines[i], CultureInfo.GetCultureInfo("en-US"));
                    }
                }
            }
            using (StreamReader rd = new StreamReader("wines_target.txt"))
            {
                string line;
                while ((line = rd.ReadLine()) != null)
                {
                    target.Add(int.Parse(line));
                }
            }
        }

        // Обучение нейрона в сеть кохонена
        public double Fit(int size,double lr)
        {

            for (int i = 0; i < size; i++)
            {
                Study(data[i], target[i], lr);
            }

            // Тестирование
            // Если size < 150, остаток идет на тестировать (150-120) = 30 идет на тестирование
            // Точность
            double acc = 0.0;
            // Количество данных которые попали в класс исходя из входных данных. Столько сколько сеть могла распознать
            // Кол-во распознаных данных
            int tr = 0;
            for (int i = size; i < 150; i++)
            {
                // Получаем кол-во данных по алгоритму WTA
                if(ForwardProp(data[i]) == target[i])
                {
                    tr++;
                }
            }
            
            // Получаем точность
            acc = (double)tr / (150.0-size);

            check = true;
            return acc;

            // Получаем погрешность
            label9.Text = "Погрешность: " + (1 - acc);

            // Выводим точность
            label5.Text = "Точность: " + (acc);
        }

        // Обучение заданного нейрона
        public void Study(double[] x,int idx,double lr=0.5)
        {
            double sq = 0;
            for(int i = 0; i < x.Length; i++)
            {
                // Для правильного обучения необходимо нормализовать входные данные
                sq += x[i] * x[i];
            }
            // Учет нормализации входного вектора
            sq = Math.Sqrt(sq);
            for(int i = 0; i < n; i++)
            {
                // Победитель тот, чье расстояние меньше, далее корректируются веса
                // lr - весовой коэфициент. В процессе обучения он уменьшается
                w[i, idx] = w[i,idx] + lr * (x[i]/sq - w[i, idx]);
            }
        }

        // Алгоритм WTA (Победитель)
        public int ForwardProp(double[] x)
        {
            // Индекс победителя
            int idx = 0;
            double max = 0;
            bool check = false;
            double s = 0;
            double sq = 0;
            for (int i = 0; i < x.Length; i++)
            {
                // Для правильного обучения необходимо нормализовать входные данные
                sq += x[i] * x[i];
            }
            // Нормализация
            sq = Math.Sqrt(sq);
            for (int i = 0; i < m; i++)
            {
                s = 0;
                for(int j = 0; j < n; j++)
                {
                    // Обучается нейрон который победил по формуле
                    s += w[j,i] * x[j]/sq; 
                }
                if (check)
                {
                    if(max < s)
                    {
                        max = s;
                        idx = i;
                    }
                }
                else
                {
                    idx = i;
                    max = s;
                    check = true;
                }
            }
            return idx;
        }

        // Обучение нейронной сети Кохонена
        private void button1_Click(object sender, EventArgs e)
        {
            try
            {
                // Размер обучающей выборки
                int size = int.Parse(textBox6.Text);
                // Весовой коэфициент
                double lr = double.Parse(textBox5.Text, CultureInfo.GetCultureInfo("en-US"));
                // Количество эпох
                int iter = int.Parse(textBox7.Text);

                if (size <= 0 || size > 150) {
                    size = 125;
                }

                if (lr <= 0 || lr > 1)
                {
                    lr = 0.5;
                }

                if (iter <= 0)
                {
                    iter = 1;
                }

                set_weights();

                // Точность
                double acc = 0;

                // Число эпох обучения
                for (int i = 0; i < iter; i++)
                    acc = Fit(size, lr);

                // Считаем погрешность
                // acc - кол-во данных и вес. коэф.
                // получаем процент ошибки
                label9.Text = "Погрешность: " + (1 - acc);
                label5.Text = "Точность: " + (acc);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }

        // Сброс весов сети
        // Начальная инициализация
        private void set_weights()
        {
            Random rnd = new Random();

            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < m; j++)
                {
                    w[i, j] = rnd.NextDouble();
                }
            }
        }

        // Для определения класса у нового объекта
        private void button2_Click(object sender, EventArgs e)
        {
            try
            {
                if(check == false)
                {
                    MessageBox.Show("Нужно сначала обучить сеть Кохонена, чтобы можно было производить классификацию.");
                }
                else
                {
                    double[] x = new double[n];
                    x[0] = double.Parse(textBox1.Text, CultureInfo.GetCultureInfo("en-US"));
                    x[1] = double.Parse(textBox2.Text, CultureInfo.GetCultureInfo("en-US"));
                    x[2] = double.Parse(textBox3.Text, CultureInfo.GetCultureInfo("en-US"));
                    x[3] = double.Parse(textBox4.Text, CultureInfo.GetCultureInfo("en-US"));

                    int c = ForwardProp(x);
                    int r = c + 1;
                    string firstCat = "Столовое вино";
                    string secondCat = "Десертное вино";
                    string thirdCat = "Крепкое десертное вино";
                    string outCat = "Не распознано";

                    // Проверка принаджелности классов
                    if (r == 1) {
                        outCat = firstCat;
                    }

                    if (r == 2) {
                        outCat = secondCat;
                    }

                    if (r == 3) {
                        outCat = thirdCat;
                    }

                    // Вывод результата
                    label8.Text = "Класс: " + (r) + " - " + outCat;
                }
                     
            } catch(Exception ex)
            {
                MessageBox.Show(ex.Message);
            }
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void label10_Click(object sender, EventArgs e)
        {

        }

        private void textBox7_TextChanged(object sender, EventArgs e)
        {

        }

        private void label11_Click(object sender, EventArgs e)
        {

        }

        private void label12_Click(object sender, EventArgs e)
        {

        }

        private void label1_Click(object sender, EventArgs e)
        {

        }

        private void label8_Click(object sender, EventArgs e)
        {

        }

        private void textBox2_TextChanged(object sender, EventArgs e)
        {

        }

        private void textBox6_TextChanged(object sender, EventArgs e)
        {

        }

        private void label5_Click_1(object sender, EventArgs e)
        {

        }

        private void label9_Click(object sender, EventArgs e)
        {

        }
    }
}
