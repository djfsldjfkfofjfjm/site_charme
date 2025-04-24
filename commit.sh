#!/bin/bash

# Скрипт для выборочного коммита изменений
# Использование: ./commit.sh "Описание коммита"

if [ -z "$1" ]; then
  echo "Необходимо указать сообщение коммита"
  echo "Пример: ./commit.sh \"Изменил шапку сайта\""
  exit 1
fi

# Показать все изменения
echo "Текущие изменения в репозитории:"
git status -s

echo ""
echo "Выберите файлы для коммита (введите путь к файлу и нажмите Enter, пустая строка для завершения):"

files_to_commit=()

while true; do
  read -p "> " file_path
  
  if [ -z "$file_path" ]; then
    break
  fi
  
  if [ -f "$file_path" ] || [ -d "$file_path" ]; then
    files_to_commit+=("$file_path")
    echo "Добавлен: $file_path"
  else
    echo "Файл не найден: $file_path"
  fi
done

if [ ${#files_to_commit[@]} -eq 0 ]; then
  echo "Нет файлов для коммита. Отмена."
  exit 1
fi

# Добавить выбранные файлы в индекс
for file in "${files_to_commit[@]}"; do
  git add "$file"
done

# Показать что будет закоммичено
echo ""
echo "Будут закоммичены следующие изменения:"
git status -s

# Подтверждение
read -p "Продолжить с коммитом? (y/n): " confirm
if [ "$confirm" != "y" ]; then
  echo "Коммит отменен."
  exit 1
fi

# Создание коммита
git commit -m "$1"

echo ""
echo "Коммит создан успешно!"
echo "Чтобы отправить изменения на GitHub, выполните: git push"