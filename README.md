# ЧАРМИ - цифровой инструмент для салонов красоты

## Рабочий процесс с Git

### Отслеживание изменений
```bash
git status                  # Показывает текущее состояние репозитория
git diff                    # Показывает сделанные изменения
git diff src/components/hero.html    # Показывает изменения в конкретном файле
```

### Выборочный коммит изменений
```bash
git add src/components/hero.html     # Добавить один конкретный файл в коммит
git add src/styles/hero.css          # Добавить другой конкретный файл
git commit -m "Изменения в секции hero"  # Сделать коммит с комментарием
```

### Отмена изменений
```bash
git checkout -- src/components/hero.html  # Отменить изменения в конкретном файле
git reset --hard                          # Отменить ВСЕ изменения (осторожно!)
git reset --hard origin/main              # Вернуться к версии на GitHub
```

### Отправка на GitHub
```bash
git push                    # Отправить коммиты на GitHub
```

### Получение последней версии с GitHub
```bash
git pull                    # Получить последние изменения с GitHub
```

## Деплой на Vercel
После push на GitHub, Vercel автоматически обновит сайт.