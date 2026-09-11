# Базовый образ Python
FROM python:3.11-slim

# Установка рабочей директории внутри контейнера
WORKDIR /app

# Копирование файла зависимостей и их установка
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование всего исходного кода приложения в контейнер
# (Убедитесь, что файл knowledge.json лежит в корне проекта рядом с этим Dockerfile)
COPY . .

# Указываем порт, который будет слушать контейнер
EXPOSE 8000

# Команда запуска приложения
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]