#!/bin/bash

# Скрипт для получения последних изменений с GitHub
# Использование: ./pull.sh

echo "Проверка наличия локальных изменений..."
if [[ -n $(git status -s) ]]; then
  echo "ВНИМАНИЕ: У вас есть несохраненные изменения:"
  git status -s
  
  echo ""
  read -p "Сохранить локальные изменения перед обновлением? (y/n): " save_changes
  
  if [ "$save_changes" = "y" ]; then
    read -p "Введите краткое описание ваших изменений: " commit_message
    git add .
    git commit -m "$commit_message"
    echo "Изменения сохранены в локальном коммите."
  else
    echo "Локальные изменения не сохранены."
    
    read -p "Отменить локальные изменения и получить последнюю версию? (y/n): " reset_changes
    if [ "$reset_changes" = "y" ]; then
      git reset --hard
      echo "Локальные изменения отменены."
    else
      echo "Операция отменена. Используйте ./commit.sh для сохранения изменений."
      exit 1
    fi
  fi
fi

echo "Получение последних изменений с GitHub..."
git pull

echo ""
echo "Обновление выполнено успешно!"