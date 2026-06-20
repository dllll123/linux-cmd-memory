// ===== Linux Commands Structured Data =====
// Extracted from: 2.1 常用 Linux 命令.md
// 31 commands across 9 categories

const COMMANDS = [
  // ==================== 一、文件与目录操作 ====================
  {
    id: "ls",
    command: "ls",
    fullName: "list",
    category: "文件与目录操作",
    categoryId: "file-dir",
    categoryIcon: "📁",
    description: "列出当前目录下的文件和文件夹",
    commonOptions: [
      { flag: "-l", meaning: "显示详细列表（权限、大小、时间等）" },
      { flag: "-a", meaning: "显示隐藏文件" },
    ],
    examples: [
      {
        command: "ls -la",
        explanation: "查看测试环境目录下所有内容，确认文件是否存在",
      },
    ],
    scenarios: [
      "你想确认某个目录下有没有配置文件",
      "你需要查看文件的权限、大小和修改时间",
    ],
    acceptableAnswers: ["ls", "ls -l", "ls -la", "ls -a"],
    difficulty: 1,
  },
  {
    id: "cd",
    command: "cd",
    fullName: "change directory",
    category: "文件与目录操作",
    categoryId: "file-dir",
    categoryIcon: "📁",
    description: "切换工作目录，进入指定路径",
    commonOptions: [],
    examples: [
      {
        command: "cd /var/log",
        explanation: "切换到 /var/log 日志目录查看服务器日志",
      },
    ],
    scenarios: [
      "你登录服务器后想进入日志目录查看日志",
      "你需要切换到项目部署目录进行操作",
    ],
    acceptableAnswers: ["cd /var/log", "cd /usr/local", "cd /var", "cd"],
    difficulty: 1,
  },
  {
    id: "pwd",
    command: "pwd",
    fullName: "print working directory",
    category: "文件与目录操作",
    categoryId: "file-dir",
    categoryIcon: "📁",
    description: "显示当前工作目录的绝对路径",
    commonOptions: [],
    examples: [
      {
        command: "pwd",
        explanation: "输出 /usr/local/test，确认当前目录位置",
      },
    ],
    scenarios: [
      "你不确定自己当前在哪个目录下，想确认路径",
      "在脚本中需要获取当前工作目录的完整路径",
    ],
    acceptableAnswers: ["pwd"],
    difficulty: 1,
  },
  {
    id: "cp",
    command: "cp",
    fullName: "copy",
    category: "文件与目录操作",
    categoryId: "file-dir",
    categoryIcon: "📁",
    description: "复制文件或目录，复制目录需加 -r 选项递归复制",
    commonOptions: [{ flag: "-r", meaning: "递归复制整个目录" }],
    examples: [
      {
        command: "cp test.sh /tmp/",
        explanation: "将测试脚本备份到 /tmp 目录",
      },
    ],
    scenarios: [
      "你需要备份一个配置文件再修改",
      "你想把测试脚本复制到另一个目录下运行",
    ],
    acceptableAnswers: [
      "cp test.sh /tmp/",
      "cp -r dir1 dir2",
      "cp file1 file2",
      "cp file /tmp/",
    ],
    difficulty: 2,
  },
  {
    id: "mv",
    command: "mv",
    fullName: "move",
    category: "文件与目录操作",
    categoryId: "file-dir",
    categoryIcon: "📁",
    description: "移动文件或重命名文件",
    commonOptions: [],
    examples: [
      {
        command: "mv oldname.sh newname.sh",
        explanation: "重命名测试脚本",
      },
    ],
    scenarios: [
      "你想给一个文件重命名",
      "你需要把日志文件移动到归档目录",
    ],
    acceptableAnswers: [
      "mv oldname newname",
      "mv file /tmp/",
      "mv old.sh new.sh",
    ],
    difficulty: 1,
  },
  {
    id: "rm",
    command: "rm",
    fullName: "remove",
    category: "文件与目录操作",
    categoryId: "file-dir",
    categoryIcon: "📁",
    description: "删除文件或目录，常用 -r 递归删除目录，-f 强制删除",
    commonOptions: [
      { flag: "-r", meaning: "递归删除目录" },
      { flag: "-f", meaning: "强制删除，不提示确认" },
    ],
    examples: [
      {
        command: "rm -rf /tmp/test",
        explanation: "强制删除临时测试目录（慎用）",
      },
    ],
    scenarios: [
      "测试完成后需要清理临时文件",
      "你想删除一个不再需要的旧日志目录",
    ],
    acceptableAnswers: ["rm file", "rm -rf dir", "rm -f file", "rm -r dir"],
    difficulty: 2,
  },
  {
    id: "touch",
    command: "touch",
    fullName: "touch",
    category: "文件与目录操作",
    categoryId: "file-dir",
    categoryIcon: "📁",
    description: "创建空文件，或更新已有文件的时间戳",
    commonOptions: [],
    examples: [
      {
        command: "touch test.txt",
        explanation: "快速创建一个测试用的临时空文件",
      },
    ],
    scenarios: [
      "你需要快速创建一个空的配置文件",
      "你想更新某个文件的时间戳使其被备份程序识别",
    ],
    acceptableAnswers: ["touch file.txt", "touch test.txt", "touch newfile"],
    difficulty: 1,
  },

  // ==================== 二、权限管理 ====================
  {
    id: "chmod",
    command: "chmod",
    fullName: "change mode",
    category: "权限管理",
    categoryId: "permission",
    categoryIcon: "🔐",
    description:
      "修改文件权限，用数字或符号设置所有者、组和其他用户的读/写/执行权限",
    commonOptions: [
      { flag: "+x", meaning: "添加可执行权限" },
      { flag: "755", meaning: "所有者读写执行，组和其他读执行" },
    ],
    examples: [
      {
        command: "chmod 755 test.sh",
        explanation: "给脚本设置可执行权限，所有者可读写执行",
      },
    ],
    scenarios: [
      "你写了一个测试脚本，运行时报错 Permission denied",
      "你需要让其他用户可以读取某个配置文件但不能修改",
    ],
    acceptableAnswers: [
      "chmod 755 file",
      "chmod +x script.sh",
      "chmod 644 file",
      "chmod 777 file",
    ],
    difficulty: 3,
  },
  {
    id: "chown",
    command: "chown",
    fullName: "change owner",
    category: "权限管理",
    categoryId: "permission",
    categoryIcon: "🔐",
    description: "修改文件的所有者",
    commonOptions: [],
    examples: [
      {
        command: "chown user test.sh",
        explanation: "将文件所有者改为指定用户",
      },
    ],
    scenarios: [
      "部署新服务后，需要把文件所有权交给服务运行账户",
      "从 root 复制了文件，需要修改归属给普通用户",
    ],
    acceptableAnswers: [
      "chown user file",
      "chown user:group file",
      "chown -R user dir",
    ],
    difficulty: 2,
  },

  // ==================== 三、远程连接与文件传输 ====================
  {
    id: "ssh",
    command: "ssh",
    fullName: "secure shell",
    category: "远程连接与文件传输",
    categoryId: "remote",
    categoryIcon: "🌐",
    description: "安全的远程连接服务器，需要用户名和 IP 地址",
    commonOptions: [
      { flag: "-p", meaning: "指定端口号" },
      { flag: "-i", meaning: "指定私钥文件" },
    ],
    examples: [
      {
        command: "ssh user@192.168.1.1",
        explanation: "以 user 身份远程登录 IP 为 192.168.1.1 的测试服务器",
      },
    ],
    scenarios: [
      "你需要登录远程测试服务器查看运行状态",
      "部署脚本前需要远程连接到生产环境服务器",
    ],
    acceptableAnswers: [
      "ssh user@192.168.1.1",
      "ssh root@10.0.0.1",
      "ssh -p 2222 user@host",
    ],
    difficulty: 2,
  },
  {
    id: "scp",
    command: "scp",
    fullName: "secure copy",
    category: "远程连接与文件传输",
    categoryId: "remote",
    categoryIcon: "🌐",
    description: "在本地和服务器之间安全地传输文件",
    commonOptions: [
      { flag: "-r", meaning: "递归传输整个目录" },
      { flag: "-P", meaning: "指定端口号" },
    ],
    examples: [
      {
        command: "scp test.sh user@192.168.1.1:/tmp/",
        explanation: "将本地的测试脚本上传到服务器的 /tmp 目录",
      },
    ],
    scenarios: [
      "你本地写好了测试脚本，需要传到服务器上运行",
      "需要从服务器下载日志文件到本地进行分析",
    ],
    acceptableAnswers: [
      "scp file user@host:/path/",
      "scp user@host:/path/file ./",
      "scp -r dir user@host:/path/",
    ],
    difficulty: 2,
  },

  // ==================== 四、压缩与解压 ====================
  {
    id: "tar",
    command: "tar",
    fullName: "tape archive",
    category: "压缩与解压",
    categoryId: "compress",
    categoryIcon: "📦",
    description:
      "打包或解压文件，常用 -z(gzip压缩) -x(解压) -v(显示过程) -f(指定文件) -c(创建)",
    commonOptions: [
      { flag: "-z", meaning: "使用 gzip 压缩/解压" },
      { flag: "-x", meaning: "解压" },
      { flag: "-c", meaning: "创建打包文件" },
      { flag: "-v", meaning: "显示处理过程" },
      { flag: "-f", meaning: "指定文件名" },
    ],
    examples: [
      {
        command: "tar -zxvf archive.tar.gz",
        explanation: "解压 .tar.gz 格式的测试环境依赖包，并显示解压过程",
      },
    ],
    scenarios: [
      "你从网上下载了一个 .tar.gz 的测试工具压缩包需要解压",
      "你想把测试环境的配置目录打包备份",
    ],
    acceptableAnswers: [
      "tar -zxvf file.tar.gz",
      "tar -zcvf file.tar.gz dir/",
      "tar -xvf file.tar",
      "tar -cvf file.tar dir/",
    ],
    difficulty: 3,
  },
  {
    id: "unzip",
    command: "unzip",
    fullName: "unzip",
    category: "压缩与解压",
    categoryId: "compress",
    categoryIcon: "📦",
    description: "专门解压 .zip 格式的压缩文件",
    commonOptions: [],
    examples: [
      {
        command: "unzip archive.zip",
        explanation: "解压测试用的 zip 包到当前目录",
      },
    ],
    scenarios: [
      "别人发给你一个 .zip 的测试数据文件需要解压",
      "CI/CD 构建产物是 .zip 格式，需要在服务器上解压部署",
    ],
    acceptableAnswers: [
      "unzip file.zip",
      "unzip archive.zip -d /tmp/",
      "unzip test.zip",
    ],
    difficulty: 1,
  },

  // ==================== 五、网络请求 ====================
  {
    id: "curl",
    command: "curl",
    fullName: "client URL",
    category: "网络请求",
    categoryId: "network",
    categoryIcon: "📡",
    description: "发送 HTTP 请求，用于测试接口或下载文件",
    commonOptions: [
      { flag: "-X", meaning: "指定请求方法（GET/POST/PUT/DELETE）" },
      { flag: "-d", meaning: "发送 POST 数据" },
      { flag: "-H", meaning: "添加请求头" },
    ],
    examples: [
      {
        command: "curl http://api.example.com",
        explanation: "快速验证接口是否正常返回数据",
      },
    ],
    scenarios: [
      "测试环境的 API 接口返回异常，你想直接用命令行验证接口",
      "你需要检查一个 URL 的 HTTP 响应状态码",
    ],
    acceptableAnswers: [
      "curl http://api.example.com",
      "curl -X POST http://api/test",
      "curl -H 'Content-Type: application/json' http://api",
    ],
    difficulty: 2,
  },
  {
    id: "wget",
    command: "wget",
    fullName: "web get",
    category: "网络请求",
    categoryId: "network",
    categoryIcon: "📡",
    description: "从网络下载文件",
    commonOptions: [
      { flag: "-O", meaning: "指定下载后的文件名" },
      { flag: "-c", meaning: "断点续传" },
    ],
    examples: [
      {
        command: "wget http://example.com/file.zip",
        explanation: "下载测试依赖包到本地",
      },
    ],
    scenarios: [
      "搭建测试环境时需要下载某个依赖的软件包",
      "你想下载一个大文件，需要支持断点续传以防网络中断",
    ],
    acceptableAnswers: [
      "wget http://example.com/file.zip",
      "wget -O newname.zip http://example.com/file.zip",
      "wget -c http://example.com/largefile",
    ],
    difficulty: 2,
  },

  // ==================== 六、系统监控与资源查看 ====================
  {
    id: "top",
    command: "top",
    fullName: "table of processes",
    category: "系统监控与资源查看",
    categoryId: "monitor",
    categoryIcon: "📊",
    description: "实时查看系统资源使用情况（CPU、内存、进程等）",
    commonOptions: [],
    examples: [
      {
        command: "top",
        explanation: "实时显示 CPU 和内存使用最高的进程，用于监控服务器性能",
      },
    ],
    scenarios: [
      "服务器响应变慢，你想找出哪个进程占用了大量 CPU",
      "性能测试时需要实时监控系统资源消耗",
    ],
    acceptableAnswers: ["top"],
    difficulty: 2,
  },
  {
    id: "htop",
    command: "htop",
    fullName: "htop",
    category: "系统监控与资源查看",
    categoryId: "monitor",
    categoryIcon: "📊",
    description:
      "top 的升级版，界面更友好，支持颜色显示和键盘交互操作（如 F6 排序）",
    commonOptions: [],
    examples: [
      {
        command: "htop",
        explanation: "运行后按 F6 可选择排序方式，快速定位资源占用高的进程",
      },
    ],
    scenarios: [
      "你觉得 top 界面太简陋，想看更直观的资源监控界面",
      "性能测试时需要交互式地筛选和排序进程",
    ],
    acceptableAnswers: ["htop"],
    difficulty: 1,
  },
  {
    id: "df",
    command: "df",
    fullName: "disk free",
    category: "系统监控与资源查看",
    categoryId: "monitor",
    categoryIcon: "📊",
    description: "查看磁盘分区使用情况",
    commonOptions: [
      { flag: "-h", meaning: "以人类可读的格式显示（GB/MB）" },
    ],
    examples: [
      {
        command: "df -h",
        explanation:
          "检查 /var/log 分区空间是否充足，避免测试日志写满磁盘",
      },
    ],
    scenarios: [
      "测试环境报磁盘空间不足，你想检查哪个分区满了",
      "部署新服务前确认目标分区有足够的可用空间",
    ],
    acceptableAnswers: ["df -h", "df"],
    difficulty: 2,
  },
  {
    id: "du",
    command: "du",
    fullName: "disk usage",
    category: "系统监控与资源查看",
    categoryId: "monitor",
    categoryIcon: "📊",
    description: "查看指定目录或文件的磁盘占用大小",
    commonOptions: [
      { flag: "-h", meaning: "以人类可读格式显示" },
      { flag: "-s", meaning: "仅显示总计大小" },
    ],
    examples: [
      {
        command: "du -sh /var/log/*",
        explanation: "查看 /var/log 下各文件/目录的磁盘占用，找出空间大户",
      },
    ],
    scenarios: [
      "磁盘快满了，你想找出到底是哪个日志文件夹占用最大",
      "清理文件前想确认各个目录的大小，决定先清理哪里",
    ],
    acceptableAnswers: [
      "du -sh dir/",
      "du -h /var/log",
      "du -sh *",
      "du -sh /var/log/*",
    ],
    difficulty: 2,
  },

  // ==================== 七、进程管理 ====================
  {
    id: "ps",
    command: "ps",
    fullName: "process status",
    category: "进程管理",
    categoryId: "process",
    categoryIcon: "⚙️",
    description: "查看当前进程快照",
    commonOptions: [
      { flag: "-ef", meaning: "显示所有进程的完整信息" },
      { flag: "aux", meaning: "BSD 风格显示所有进程（含 CPU/内存占比）" },
    ],
    examples: [
      {
        command: "ps -ef | grep java",
        explanation: "查看所有 Java 相关进程，确认测试服务器上的 Java 服务是否运行",
      },
    ],
    scenarios: [
      "你想确认某个服务进程是否在运行",
      "需要查看某个进程的 PID 以便后续操作（如 kill）",
    ],
    acceptableAnswers: [
      "ps -ef",
      "ps aux",
      "ps -ef | grep java",
      "ps aux | grep nginx",
    ],
    difficulty: 2,
  },
  {
    id: "kill",
    command: "kill",
    fullName: "kill",
    category: "进程管理",
    categoryId: "process",
    categoryIcon: "⚙️",
    description: "终止指定进程",
    commonOptions: [
      { flag: "-9", meaning: "强制终止（SIGKILL 信号）" },
      { flag: "-15", meaning: "优雅终止（SIGTERM 信号，默认）" },
    ],
    examples: [
      {
        command: "kill -9 12345",
        explanation: "强制结束 PID 为 12345 的异常进程",
      },
    ],
    scenarios: [
      "测试进程卡死了，用常规方法杀不掉",
      "你想重启某个服务，需要先停止旧进程",
    ],
    acceptableAnswers: ["kill 12345", "kill -9 12345", "kill -15 5678"],
    difficulty: 2,
  },

  // ==================== 八、目录创建与文件查看 ====================
  {
    id: "mkdir",
    command: "mkdir",
    fullName: "make directory",
    category: "目录创建与文件查看",
    categoryId: "view",
    categoryIcon: "📂",
    description: "创建新目录",
    commonOptions: [
      { flag: "-p", meaning: "递归创建多级目录" },
    ],
    examples: [
      {
        command: "mkdir test_env",
        explanation: "创建 test_env 目录用于存放测试文件",
      },
    ],
    scenarios: [
      "搭建测试环境时需要创建专门的目录存放测试数据",
      "你想创建一个多层级的目录结构用于测试",
    ],
    acceptableAnswers: ["mkdir test", "mkdir -p a/b/c", "mkdir test_env"],
    difficulty: 1,
  },
  {
    id: "cat",
    command: "cat",
    fullName: "concatenate",
    category: "目录创建与文件查看",
    categoryId: "view",
    categoryIcon: "📂",
    description: "查看文件内容，或将多个文件合并输出",
    commonOptions: [
      { flag: "-n", meaning: "显示行号" },
    ],
    examples: [
      {
        command: "cat error.log",
        explanation: "直接在终端显示 error.log 的完整内容",
      },
    ],
    scenarios: [
      "你想快速看一下配置文件的内容",
      "需要将两个日志文件合并输出查看",
    ],
    acceptableAnswers: ["cat file", "cat error.log", "cat -n file"],
    difficulty: 1,
  },
  {
    id: "more",
    command: "more",
    fullName: "more",
    category: "目录创建与文件查看",
    categoryId: "view",
    categoryIcon: "📂",
    description: "分页显示文件内容，按空格键向下翻页",
    commonOptions: [],
    examples: [
      {
        command: "more access.log",
        explanation: "分页查看较大的日志文件，避免一次性加载过多内容",
      },
    ],
    scenarios: [
      "你打开一个大日志文件，不想一次性加载全部内容导致终端卡顿",
      "在无法使用 less 的旧系统上分页查看文件",
    ],
    acceptableAnswers: ["more file", "more access.log"],
    difficulty: 2,
  },
  {
    id: "less",
    command: "less",
    fullName: "less",
    category: "目录创建与文件查看",
    categoryId: "view",
    categoryIcon: "📂",
    description:
      "比 more 更灵活的分页查看工具，支持上下翻页和 /关键字 搜索",
    commonOptions: [
      { flag: "-N", meaning: "显示行号" },
    ],
    examples: [
      {
        command: "less server.log",
        explanation:
          "打开日志后输入 /error 可快速定位错误信息，是分析大日志最常用的命令",
      },
    ],
    scenarios: [
      "你需要分析一个几百MB的大日志文件，想搜索特定错误信息",
      "查看日志时需要能上下翻页来回查看",
    ],
    acceptableAnswers: [
      "less server.log",
      "less file",
      "less -N error.log",
    ],
    difficulty: 2,
  },
  {
    id: "grep",
    command: "grep",
    fullName: "global regular expression print",
    category: "目录创建与文件查看",
    categoryId: "view",
    categoryIcon: "📂",
    description: "在文件中搜索匹配关键字的行，支持正则表达式",
    commonOptions: [
      { flag: "-i", meaning: "忽略大小写" },
      { flag: "-n", meaning: "显示行号" },
      { flag: "-r", meaning: "递归搜索目录" },
    ],
    examples: [
      {
        command: "grep -in 'error' server.log",
        explanation:
          "在 server.log 中不区分大小写查找所有含 error 的行并显示行号",
      },
    ],
    scenarios: [
      "服务报错了，你想从日志中快速找出所有错误行",
      "你想在一个目录下的所有文件中搜索某个关键字",
    ],
    acceptableAnswers: [
      "grep error file",
      "grep -in 'error' server.log",
      "grep -r 'keyword' dir/",
      "grep -i 'ERROR' *.log",
    ],
    difficulty: 2,
  },
  {
    id: "head",
    command: "head",
    fullName: "head",
    category: "目录创建与文件查看",
    categoryId: "view",
    categoryIcon: "📂",
    description: "查看文件开头部分，默认显示前 10 行",
    commonOptions: [
      { flag: "-n", meaning: "指定显示的行数" },
    ],
    examples: [
      {
        command: "head -n 5 access.log",
        explanation: "查看日志的前 5 行，确认日志格式或起始时间",
      },
    ],
    scenarios: [
      "你想确认一个日志文件的格式而不需要看全部内容",
      "查看 CSV 数据文件的前几行确认列结构和数据样式",
    ],
    acceptableAnswers: [
      "head file",
      "head -n 20 file",
      "head -n 5 access.log",
    ],
    difficulty: 1,
  },
  {
    id: "tail",
    command: "tail",
    fullName: "tail",
    category: "目录创建与文件查看",
    categoryId: "view",
    categoryIcon: "📂",
    description: "查看文件末尾部分，默认显示最后 10 行",
    commonOptions: [
      { flag: "-f", meaning: "实时跟踪文件新增内容（CTRL+C 退出）" },
      { flag: "-n", meaning: "指定显示的行数" },
    ],
    examples: [
      {
        command: "tail -f error.log",
        explanation: "实时滚动显示 error.log 最新日志，用于上线后监控",
      },
    ],
    scenarios: [
      "服务正在运行，你想实时看到最新的日志输出",
      "你需要查看日志文件的最后几十行来检查最新记录",
    ],
    acceptableAnswers: [
      "tail -f error.log",
      "tail file",
      "tail -n 50 file",
      "tail -f /var/log/app.log",
    ],
    difficulty: 2,
  },

  // ==================== 九、文件查找与命令定位 ====================
  {
    id: "find",
    command: "find",
    fullName: "find",
    category: "文件查找与命令定位",
    categoryId: "find",
    categoryIcon: "🔍",
    description: "按条件在指定目录下查找文件，支持按名称、大小、修改时间等过滤",
    commonOptions: [
      { flag: "-name", meaning: "按文件名模式查找" },
      { flag: "-size", meaning: "按文件大小查找" },
      { flag: "-mtime", meaning: "按修改时间查找（天）" },
    ],
    examples: [
      {
        command: 'find /var/log -name "*.log"',
        explanation: "找出 /var/log 下所有 .log 结尾的文件",
      },
    ],
    scenarios: [
      "你忘记某个配置文件的具体位置，只记得文件名",
      "需要找出超过 100MB 的大日志文件进行清理",
    ],
    acceptableAnswers: [
      'find /var/log -name "*.log"',
      "find / -name filename",
      "find . -type f -name '*.txt'",
    ],
    difficulty: 3,
  },
  {
    id: "which",
    command: "which",
    fullName: "which",
    category: "文件查找与命令定位",
    categoryId: "find",
    categoryIcon: "🔍",
    description: "查找可执行命令的绝对路径",
    commonOptions: [],
    examples: [
      {
        command: "which python3",
        explanation: "输出 /usr/bin/python3，确认 Python 安装路径",
      },
    ],
    scenarios: [
      "你想知道某个命令的可执行文件到底在哪个目录",
      "写脚本时需要指定解释器的完整路径",
    ],
    acceptableAnswers: ["which python3", "which java", "which node"],
    difficulty: 1,
  },
];

// ===== Category metadata =====
const CATEGORIES = [
  {
    id: "file-dir",
    name: "文件与目录操作",
    icon: "📁",
    commands: ["ls", "cd", "pwd", "cp", "mv", "rm", "touch"],
  },
  { id: "permission", name: "权限管理", icon: "🔐", commands: ["chmod", "chown"] },
  { id: "remote", name: "远程连接与文件传输", icon: "🌐", commands: ["ssh", "scp"] },
  { id: "compress", name: "压缩与解压", icon: "📦", commands: ["tar", "unzip"] },
  { id: "network", name: "网络请求", icon: "📡", commands: ["curl", "wget"] },
  {
    id: "monitor",
    name: "系统监控与资源查看",
    icon: "📊",
    commands: ["top", "htop", "df", "du"],
  },
  { id: "process", name: "进程管理", icon: "⚙️", commands: ["ps", "kill"] },
  {
    id: "view",
    name: "目录创建与文件查看",
    icon: "📂",
    commands: ["mkdir", "cat", "more", "less", "grep", "head", "tail"],
  },
  { id: "find", name: "文件查找与命令定位", icon: "🔍", commands: ["find", "which"] },
];

// ===== Build lookup maps =====
const COMMANDS_BY_ID = {};
const COMMANDS_BY_CATEGORY = {};

COMMANDS.forEach((cmd) => {
  COMMANDS_BY_ID[cmd.id] = cmd;
  if (!COMMANDS_BY_CATEGORY[cmd.categoryId]) {
    COMMANDS_BY_CATEGORY[cmd.categoryId] = [];
  }
  COMMANDS_BY_CATEGORY[cmd.categoryId].push(cmd);
});
