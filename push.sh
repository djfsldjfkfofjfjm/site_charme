#!/bin/bash

# Скрипт для отправки изменений на GitHub
# Использование: ./push.sh

# Проверка наличия коммитов для отправки
COMMITS_TO_PUSH=$(git log origin/main..HEAD --oneline | wc -l)

if [ "$COMMITS_TO_PUSH" -eq 0 ]; then
  echo "Нет новых коммитов для отправки на GitHub."
  exit 0
fi

# Показать коммиты, которые будут отправлены
echo "Следующие коммиты будут отправлены на GitHub:"
git log origin/main..HEAD --oneline

echo ""
read -p "Отправить эти коммиты? (y/n): " confirm
if [ "$confirm" != "y" ]; then
  echo "Отправка отменена."
  exit 1
fi

# Отправка изменений
git push

echo ""
echo "Коммиты успешно отправлены на GitHub!"
echo "Vercel автоматически обновит сайт в течение нескольких минут."