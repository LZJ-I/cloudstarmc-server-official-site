# Shell 小抄

## 目录与文件

- `cd`、`pwd`、`ls` / `dir`
- `cp`、`mv`、`rm`（删除请格外小心）

## 重定向

```bash
command > out.txt    # 覆盖写
command >> out.txt   # 追加
```

## 环境变量

```bash
export PATH="/usr/local/bin:$PATH"
echo $PATH
```

## 帮助

- `man ls`
- `ls --help`
