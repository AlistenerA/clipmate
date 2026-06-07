> From: https://chatgpt.com/g/g-p-6a255015fb8481918bcd91c00c36d65b-peter-s-questions/c/6a255109-8118-83ec-a6b2-ae3d41b752cc

# chatgpt response

我会先核对 OpenCode 官方安装页和相关包管理器信息，再把 Windows 初学者可执行的流程整理成一份完整指南。

我已核对到官方安装方式：Windows 下官方列出 Chocolatey、Scoop、NPM 等方式，同时官方仍建议 Windows 最佳体验使用 WSL。你当前已有 Node.js，所以我会把 npm 作为主线。

下面这份指南按 **Windows 11 + 已安装 VS Code / Git / GitHub Desktop / Node.js** 的环境写。OpenCode 官方文档目前列出的 Windows 安装方式包括 **Chocolatey、Scoop、NPM、Mise、Docker**，并说明 Windows 最佳体验推荐 WSL；但你希望主要用 Windows 命令行，且已经装好 Node.js，所以本指南主推 **npm 全局安装 `opencode-ai@latest`**，同时保留 Scoop / Chocolatey 作为备选。官方 README 也列出了 `npm i -g opencode-ai@latest`、`scoop install opencode`、`choco install opencode` 这些安装方式。([OpenCode](https://opencode.ai/docs))

---

# 一、前置检查

建议先打开 **Windows Terminal / CMD / PowerShell / VS Code 终端**，分别执行下面命令。

## 1. 检查 Node.js

```bat
node -v
```

作用：查看 Node.js 是否安装成功以及版本号。

正常情况会输出类似：

```bat
v22.x.x
```

如果提示“不是内部或外部命令”，说明 Node.js 没有加入 PATH，优先重新安装 Node.js，并勾选 **Add to PATH**，然后重启终端、VS Code。

---

## 2. 检查 npm

```bat
npm -v
```

作用：查看 npm 是否可用。npm 是 Node.js 附带的包管理器，后面安装 OpenCode 会用到它。

正常情况会输出类似：

```bat
10.x.x
```

如果 `node -v` 正常但 `npm -v` 不正常，通常是 Node.js 安装不完整或 PATH 异常。建议重新安装 Node.js LTS / Current 版本。

---

## 3. 检查 Git

```bat
git --version
```

作用：确认 Git 命令可用。

正常情况会输出类似：

```bat
git version 2.x.x.windows.x
```

如果无法识别 Git，重新安装 Git for Windows，并确保安装时选择允许在命令行使用 Git。

---

## 4. 检查命令实际路径

在 **CMD** 中执行：

```bat
where node
where npm
where git
```

作用：查看 Windows 当前找到的是哪个 `node.exe`、`npm.cmd`、`git.exe`。

正常情况可能类似：

```bat
C:\Program Files\nodejs\node.exe
C:\Program Files\nodejs\npm.cmd
C:\Program Files\Git\cmd\git.exe
```

注意：在 **PowerShell** 中，`where` 可能被当成别的命令别名。PowerShell 更推荐这样写：

```powershell
where.exe node
where.exe npm
where.exe git
```

或者：

```powershell
Get-Command node
Get-Command npm
Get-Command git
```

如果找不到路径，说明 PATH 没配置好。

---

## 5. 检查 npm 全局安装目录

```bat
npm config get prefix
```

作用：查看 npm 全局安装包会放在哪里。

常见输出：

```bat
C:\Users\你的用户名\AppData\Roaming\npm
```

这个目录后面必须在 PATH 里，否则安装了 OpenCode 也可能识别不了 `opencode` 命令。

继续检查：

```bat
where opencode
```

如果还没安装 OpenCode，这一步找不到是正常的。安装后再执行它。

---

## 6. 检查 VS Code 终端能否识别命令

打开 VS Code，按：

```text
Ctrl + `
```

打开终端，执行：

```bat
node -v
npm -v
git --version
```

如果 Windows 终端能识别，但 VS Code 终端不能识别，通常是 VS Code 打开太早，没有加载新的 PATH。处理方法：

1. 关闭 VS Code；
2. 重新打开 VS Code；
3. 重新打开终端；
4. 再执行检查命令。

---

# 二、OpenCode 安装方案

## 方案对比

| 方式 | 命令 | 适合你吗 | 说明 |
|---|---|---|---|
| npm 全局安装 | `npm i -g opencode-ai@latest` | 推荐 | 你已安装 Node.js，最直接、最少额外依赖 |
| Scoop 安装 | `scoop install opencode` | 备选 | 需要先安装 Scoop，偏开发者友好，一般不需要管理员权限 |
| Chocolatey 安装 | `choco install opencode` | 备选 | 需要先安装 Chocolatey，通常需要管理员 PowerShell |
| curl 安装脚本 | `curl -fsSL ... | bash` | 不推荐给你 | 官方列为简单方式，但对 Windows 初学者不够透明，且依赖类 Unix shell |

官方文档说 OpenCode CLI 不带参数时会启动 TUI，`opencode [project]` 可启动终端界面；CLI 也支持 `--version` 查看版本。([OpenCode](https://opencode.ai/docs/cli/))

---

## 推荐方式：npm 全局安装

在 **CMD 或 PowerShell** 中执行：

```bat
npm i -g opencode-ai@latest
```

作用：用 npm 全局安装 OpenCode 最新版本。

安装完成后检查：

```bat
opencode --version
```

作用：查看 OpenCode 版本号。

也可以执行：

```bat
opencode -v
```

作用：`-v` 是 `--version` 的短写。

检查命令路径：

```bat
where opencode
```

PowerShell 中建议：

```powershell
where.exe opencode
```

作用：确认系统能找到 `opencode` 命令。

---

## npm 卸载

```bat
npm uninstall -g opencode-ai
```

作用：卸载通过 npm 全局安装的 OpenCode。

---

## npm 重新安装

```bat
npm uninstall -g opencode-ai
npm cache verify
npm i -g opencode-ai@latest
opencode --version
```

作用分别是：

- `npm uninstall -g opencode-ai`：删除旧版本；
- `npm cache verify`：检查 npm 缓存；
- `npm i -g opencode-ai@latest`：重新安装最新版；
- `opencode --version`：确认安装成功。

---

## Scoop 安装方式

前提：你已经安装 Scoop。

```powershell
scoop install opencode
```

作用：用 Scoop 安装 OpenCode。

检查：

```powershell
opencode --version
```

说明：Scoop 比较适合开发者，但你现在没必要为了 OpenCode 额外安装 Scoop。你已装 Node.js，优先 npm 即可。

---

## Chocolatey 安装方式

前提：你已经安装 Chocolatey。Chocolatey 官方安装说明通常要求使用管理员 shell。([Chocolatey Docs](https://docs.chocolatey.org/en-us/choco/setup/?utm_source=chatgpt.com))

```powershell
choco install opencode
```

作用：用 Chocolatey 安装 OpenCode。

风险提示：如果你没有 Chocolatey，不建议为了这一步单独折腾；Chocolatey 安装和权限配置对初学者更容易出错。

---

# 三、安装后的验证

## 1. 确认命令可用

```bat
opencode --version
```

作用：能输出版本号，就说明命令可用。

如果失败，执行：

```bat
where opencode
```

PowerShell：

```powershell
where.exe opencode
```

如果找不到，继续执行：

```bat
npm config get prefix
```

假设输出：

```bat
C:\Users\你的用户名\AppData\Roaming\npm
```

你需要确认这个路径在系统 PATH 里。

---

## 2. 在测试目录启动 OpenCode

先创建测试目录：

```bat
mkdir D:\AI-Code-Lab
mkdir D:\AI-Code-Lab\opencode-test
cd /d D:\AI-Code-Lab\opencode-test
```

作用：

- `mkdir D:\AI-Code-Lab`：创建实验总目录；
- `mkdir D:\AI-Code-Lab\opencode-test`：创建 OpenCode 测试项目；
- `cd /d ...`：切换到 D 盘目标目录。

启动 OpenCode：

```bat
opencode
```

作用：在当前项目目录启动 OpenCode TUI。官方文档也给出了进入项目目录后运行 `opencode` 的初始化流程。([OpenCode](https://opencode.ai/docs))

首次使用可能需要配置模型或登录。官方文档提到可以在 TUI 中运行：

```text
/connect
```

作用：连接模型服务或配置 provider。([OpenCode](https://opencode.ai/docs))

---

## 3. 初始化项目上下文

进入 OpenCode 后，可以输入：

```text
/init
```

作用：让 OpenCode 分析项目，并在项目根目录创建 `AGENTS.md`。官方建议把 `AGENTS.md` 提交到 Git，因为它帮助 OpenCode 理解项目结构和代码习惯。([OpenCode](https://opencode.ai/docs))

---

## 4. 如何退出

优先尝试：

```text
/exit
```

或者按：

```text
Ctrl + C
```

如果终端仍停留，可再按一次 `Ctrl + C`。

---

## 5. command not found / 不是内部或外部命令排查

按顺序执行：

```bat
npm list -g opencode-ai --depth=0
```

作用：确认 npm 全局是否真的安装了 `opencode-ai`。

```bat
npm config get prefix
```

作用：查看 npm 全局命令目录。

```bat
where opencode
```

作用：查看 Windows 是否能找到 `opencode` 命令。

如果 `npm list -g` 能看到包，但 `where opencode` 找不到，基本就是 PATH 没包含 npm 全局目录。把下面路径加入用户 PATH：

```bat
C:\Users\你的用户名\AppData\Roaming\npm
```

然后重启终端和 VS Code。

---

# 四、Git 安全隔离方案

核心原则：**永远不要在 main/master 分支直接让 OpenCode 修改代码。**

## 1. 查看当前分支

```bat
git branch
```

作用：查看当前在哪个分支。带 `*` 的是当前分支。

---

## 2. 查看当前状态

```bat
git status
```

作用：查看有没有未提交修改。

如果显示：

```text
nothing to commit, working tree clean
```

说明工作区干净。

---

## 3. 修改前先提交干净基线

如果是新项目：

```bat
git add .
git commit -m "baseline: initial safe state before OpenCode"
```

作用：

- `git add .`：把当前所有文件加入暂存区；
- `git commit -m ...`：保存一个“OpenCode 修改前”的安全快照。

风险提示：执行 `git add .` 前一定要检查有没有 `.env`、密码文件、数据库文件。更安全的方式是先执行：

```bat
git status
```

---

## 4. 创建 AI 专用分支

```bat
git checkout -b ai/opencode-test
```

作用：从当前分支创建一个新分支，并切换过去。

以后你可以把不同任务分成不同分支，例如：

```bat
git checkout -b ai/fix-login-button
git checkout -b ai/refactor-readme
git checkout -b ai/add-test-page
```

---

## 5. 运行 OpenCode 前再次确认

```bat
git status
```

作用：确认你已经在 AI 分支，并且工作区是干净的。

---

## 6. OpenCode 修改后审查改动

```bat
git status
```

作用：看它改了哪些文件。

```bat
git diff
```

作用：逐行查看 OpenCode 修改了什么。

---

## 7. 分块确认提交

```bat
git add -p
```

作用：不是一次性添加全部改动，而是逐块确认。Git 官方文档说明 `git add -p` 会交互式选择 patch hunks，让你在加入暂存区前审查差异。([git-scm.com](https://git-scm.com/docs/git-add))

常见选项：

```text
y = 接受这一块
n = 不接受这一块
q = 退出
s = 尝试拆成更小块
```

---

## 8. 提交安全节点

```bat
git commit -m "ai: update test project with OpenCode"
```

作用：把已确认的改动保存成一个 Git 节点。

---

## 9. 撤销单个文件未提交改动

```bat
git restore 文件路径
```

例子：

```bat
git restore src\app.js
```

作用：把这个文件恢复到最近一次提交的状态。Git 官方文档说明 `git restore` 用于恢复工作区文件，也支持恢复所有文件。([git-scm.com](https://git-scm.com/docs/git-restore))

风险提示：会丢弃这个文件尚未提交的修改。

---

## 10. 撤销全部未提交改动

```bat
git restore .
```

作用：撤销当前目录下所有已跟踪文件的未提交修改。

风险提示：这是高风险命令。它会丢弃所有 tracked files 的未提交修改，但不会删除未跟踪的新文件。

---

## 11. 回到上一个提交

```bat
git reset --hard HEAD
```

作用：把当前分支恢复到最近一次提交，丢弃已跟踪文件的未提交修改。

风险提示：高风险。会丢弃已跟踪文件的本地修改。

如果要回到上一个提交：

```bat
git reset --hard HEAD~1
```

作用：把当前分支退回到上一个 commit。

风险提示：极高风险。若该 commit 没有推送或没有备份，可能造成提交历史丢失。Git 官方文档也提醒，不要对已经交给别人的提交随意使用硬重置。([git-scm.com](https://git-scm.com/docs/git-reset))

---

## 12. 临时保存修改

```bat
git stash push -m "temp: before switching branch"
```

作用：把当前未提交修改临时收起来，工作区变干净。

查看 stash：

```bat
git stash list
```

恢复最近一次 stash：

```bat
git stash pop
```

作用：把临时保存的修改拿回来。Git 官方文档说明 `git stash push` 会保存本地修改并把工作区回滚到 `HEAD`。([git-scm.com](https://git-scm.com/docs/git-stash))

---

## 13. 删除未跟踪文件

先 dry-run：

```bat
git clean -n
```

作用：只预览会删除哪些未跟踪文件，不真的删除。

确认无误后：

```bat
git clean -fd
```

作用：删除未被 Git 跟踪的文件和目录。

风险提示：极高风险。必须先执行 `git clean -n`。Git 官方文档说明 `git clean -n` 是 dry-run，不会真的删除；`git clean -fd` 会删除未跟踪文件和目录。([git-scm.com](https://git-scm.com/docs/git-clean))

---

# 五、推荐项目目录和完整测试流程

建议测试目录：

```bat
D:\AI-Code-Lab\opencode-test
```

下面是从零开始的完整流程。

---

## 1. 创建目录

```bat
mkdir D:\AI-Code-Lab
mkdir D:\AI-Code-Lab\opencode-test
cd /d D:\AI-Code-Lab\opencode-test
```

作用：创建并进入测试项目目录。

---

## 2. 创建测试文件

```bat
echo # OpenCode Test Project > README.md
echo console.log("Hello OpenCode"); > app.js
```

作用：

- 创建 `README.md`；
- 创建简单的 `app.js`。

---

## 3. 初始化 Git 仓库

```bat
git init
```

作用：把当前目录变成 Git 仓库。

---

## 4. 创建 `.gitignore`

```bat
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo *.log >> .gitignore
```

作用：避免把依赖目录、密钥文件、日志文件提交进去。

---

## 5. 提交初始基线

```bat
git status
git add README.md app.js .gitignore
git commit -m "baseline: initial test project"
```

作用：

- `git status`：确认当前有哪些文件；
- `git add ...`：只添加指定文件；
- `git commit ...`：保存初始安全快照。

---

## 6. 创建 OpenCode 专用分支

```bat
git checkout -b ai/opencode-test
```

作用：创建 AI 修改专用分支，避免污染 main/master。

---

## 7. 启动 OpenCode

```bat
opencode
```

作用：进入 OpenCode 交互界面。

建议你先输入分析型请求：

```text
请先只分析这个小项目的结构，不要修改任何文件。请列出你建议做的最小改动计划。
```

如果想初始化：

```text
/init
```

作用：生成 `AGENTS.md`。生成后先退出，审查文件。

---

## 8. 查看 OpenCode 改了什么

```bat
git status
git diff
```

作用：

- `git status`：看哪些文件变了；
- `git diff`：看具体改动内容。

---

## 9. 分块加入

```bat
git add -p
```

作用：逐块确认，不要无脑 `git add .`。

---

## 10. 提交修改

```bat
git commit -m "ai: initialize OpenCode project context"
```

作用：保存一次安全节点。

---

# 六、VS Code + GitHub Desktop 配合使用

## 1. 用 VS Code 打开项目

```bat
cd /d D:\AI-Code-Lab\opencode-test
code .
```

作用：

- `cd /d ...`：进入项目目录；
- `code .`：用 VS Code 打开当前目录。

如果 `code` 无法识别，在 VS Code 里按 `Ctrl + Shift + P`，搜索：

```text
Shell Command: Install 'code' command in PATH
```

Windows 版 VS Code 有时不显示这个命令，这种情况下直接在 VS Code 里选择“文件 → 打开文件夹”。

---

## 2. 在 VS Code 终端运行 OpenCode

VS Code 里按：

```text
Ctrl + `
```

然后执行：

```bat
opencode
```

作用：在当前项目目录运行 OpenCode。

---

## 3. 用 VS Code Source Control 查看改动

点击左侧 Source Control 图标，或按：

```text
Ctrl + Shift + G
```

你可以看到改动文件。VS Code 官方文档说明，Source Control 视图可以查看变更、暂存文件，也可以在 diff 视图中更细粒度地暂存行或选择。([Visual Studio Code](https://code.visualstudio.com/docs/sourcecontrol/overview?utm_source=chatgpt.com))

建议：

- 只看 diff；
- 不要点 `Discard All Changes`；
- 提交前仍然回到命令行执行 `git diff` 和 `git add -p`。

---

## 4. 用 GitHub Desktop 查看 diff

在 GitHub Desktop 中：

1. File → Add local repository；
2. 选择：

```bat
D:\AI-Code-Lab\opencode-test
```

3. 进入 Changes 页面查看文件差异。

GitHub Desktop 适合看 diff，但初学阶段不建议用它做大规模 discard / reset 操作。

---

## 5. 避免误点 Discard All Changes

风险提示：`Discard All Changes` 会丢弃当前未提交修改，部分情况下还可能影响未跟踪文件。初学者不要用它批量恢复。

建议你只用命令行恢复：

恢复一个文件：

```bat
git restore src\app.js
```

恢复全部已跟踪文件：

```bat
git restore .
```

删除未跟踪文件前先预览：

```bat
git clean -n
```

确认后才执行：

```bat
git clean -fd
```

---

## 6. 是否建议马上 push 到 GitHub？

不建议。

你现在的目标是先熟悉本地安全流程。建议先做到：

```bat
git status
git diff
git add -p
git commit
git restore
git stash
git clean -n
```

这些命令都熟悉后，再考虑 push。

---

# 七、OpenCode 使用安全规范

OpenCode 官方文档提到，Plan mode 会禁用修改能力，用于先提出实现计划；可用 `Tab` 在 Plan 和 Build 之间切换。官方 Agents 文档也说明 Plan agent 适合分析代码、提出建议、制定计划，不直接修改代码。([OpenCode](https://opencode.ai/docs))

建议你固定遵守下面规则：

## 1. 先分析，不要一上来让它改

推荐提示词：

```text
请只分析项目结构，不要修改任何文件。请告诉我这个项目的入口文件、主要功能、潜在问题。
```

---

## 2. 先列计划，再确认执行

```text
请先列出修改计划，不要修改文件。每一步说明会改哪个文件、为什么改。
```

确认后再说：

```text
只执行计划中的第 1 步，不要改其他文件。
```

---

## 3. 一次只改一个小功能

正确：

```text
请只给 app.js 增加一个 add(a, b) 函数，并补充一个简单示例。
```

不推荐：

```text
帮我重构整个项目，顺便优化所有代码。
```

---

## 4. 不要让它批量重构整个项目

风险提示：批量重构会让 `git diff` 难以审查，也更容易误删代码。

---

## 5. 不要输入敏感信息

不要把下面内容交给 OpenCode：

```text
API Key
密码
身份证号
银行卡号
服务器私钥
数据库连接串
真实用户数据
```

---

## 6. 不要让它直接修改敏感文件

不要让它改：

```text
.env
.env.local
id_rsa
*.pem
*.key
*.sqlite
*.db
production.config
```

建议加入 `.gitignore`：

```bat
echo .env >> .gitignore
echo .env.local >> .gitignore
echo *.pem >> .gitignore
echo *.key >> .gitignore
echo *.db >> .gitignore
echo *.sqlite >> .gitignore
```

---

## 7. 每次运行后必须看 diff

```bat
git diff
```

看不懂的地方不要提交。

---

## 8. 看不懂的改动不要 commit

可以先问 OpenCode：

```text
请解释你对 app.js 的每一处修改，尤其是为什么删除这些代码。不要继续修改文件。
```

---

## 9. 大改动前先建新分支

```bat
git checkout -b ai/big-change-test
```

作用：把高风险尝试隔离到独立分支。

---

## 10. 优先使用 Plan 模式

进入 OpenCode 后按：

```text
Tab
```

切到 Plan 模式后再提需求。

也可以尝试直接指定 agent：

```bat
opencode --agent plan
```

作用：用 Plan agent 启动，更适合只读分析。CLI 文档列出 `--agent` 参数，Agents 文档说明 Plan 是受限的分析型 agent。([OpenCode](https://opencode.ai/docs/cli/))

---

# 八、误操作恢复手册

## 场景 1：OpenCode 改坏了一个文件

查看状态：

```bat
git status
```

恢复单个文件：

```bat
git restore 路径\文件名
```

例子：

```bat
git restore app.js
```

风险等级：中。只丢弃该文件未提交改动。

---

## 场景 2：OpenCode 改坏了多个文件

先看哪些文件变了：

```bat
git status
```

全部恢复已跟踪文件：

```bat
git restore .
```

风险等级：高。会丢弃所有已跟踪文件的未提交改动。

如果还生成了新文件，先预览：

```bat
git clean -n
```

确认后删除：

```bat
git clean -fd
```

风险等级：极高。未跟踪文件被删除后 Git 通常无法恢复。

---

## 场景 3：我误删了文件

如果文件已经被 Git 跟踪过：

```bat
git status
git restore 被删文件路径
```

例子：

```bat
git restore src\main.js
```

风险等级：低。只要这个文件之前提交过，通常可以恢复。

如果文件从未被 Git 跟踪，也没有备份，Git 无法帮你恢复。

---

## 场景 4：我误提交了错误代码

如果还没有 push，想撤销最后一次提交但保留代码：

```bat
git reset --soft HEAD~1
```

作用：撤销最后一次 commit，但保留改动在暂存区。

如果想撤销最后一次提交，并把修改留在工作区：

```bat
git reset --mixed HEAD~1
```

作用：撤销 commit 和 add，但代码还在。

如果想连代码改动也全部丢弃：

```bat
git reset --hard HEAD~1
```

风险提示：极高。会回退提交并丢弃对应改动。

---

## 场景 5：我在错误分支上操作了

先保存当前改动：

```bat
git stash push -m "temp: changes made on wrong branch"
```

切到正确分支：

```bat
git checkout 正确分支名
```

新建正确 AI 分支：

```bat
git checkout -b ai/correct-task
```

恢复改动：

```bat
git stash pop
```

风险等级：中。`stash pop` 可能产生冲突，冲突时不要慌，先执行：

```bat
git status
```

---

## 场景 6：我想回到 OpenCode 修改前

如果你按本指南提前做了基线 commit：

```bat
git log --oneline
```

找到基线 commit，例如：

```text
abc1234 baseline: initial safe state before OpenCode
```

回到这个提交：

```bat
git reset --hard abc1234
```

风险提示：极高。会丢弃基线之后当前分支上的工作区改动和提交位置。

更稳妥做法是新建一个恢复分支：

```bat
git checkout -b recover/before-opencode abc1234
```

作用：不破坏当前分支，只从旧提交开一个新分支。

---

## 场景 7：我想保留部分修改、丢弃部分修改

先交互式选择要提交的部分：

```bat
git add -p
```

提交保留部分：

```bat
git commit -m "keep: selected safe changes"
```

丢弃剩余已跟踪文件改动：

```bat
git restore .
```

如果有 OpenCode 生成的多余新文件：

```bat
git clean -n
git clean -fd
```

风险提示：`git clean -fd` 必须先 `git clean -n`。

---

# 九、日常工作流模板

你每天实际使用时照着做：

## 1. 打开项目

```bat
cd /d D:\你的项目路径
```

作用：进入项目目录。

---

## 2. 检查状态

```bat
git status
```

作用：确认当前分支和工作区状态。

---

## 3. 确认当前不在 main/master 直接改

```bat
git branch
```

如果在 main/master，新建分支：

```bat
git checkout -b ai/你的任务名
```

例子：

```bat
git checkout -b ai/fix-readme
```

作用：创建 AI 专用分支。

---

## 4. 启动 OpenCode，先分析

```bat
opencode
```

进入后先说：

```text
请只分析项目，不要修改文件。请列出你建议的最小修改计划。
```

---

## 5. 小范围修改

确认计划后说：

```text
只执行第 1 步，只允许修改 README.md，不要修改其他文件。
```

---

## 6. 审查 diff

退出 OpenCode 后执行：

```bat
git status
git diff
```

作用：确认它到底改了什么。

---

## 7. 手动测试

根据项目类型执行，例如 Node 项目：

```bat
npm test
```

或者：

```bat
node app.js
```

作用：确认代码能运行。

---

## 8. 分块添加

```bat
git add -p
```

作用：只加入你看懂且确认安全的修改。

---

## 9. 提交

```bat
git commit -m "ai: 完成某个小修改"
```

作用：保存安全节点。

---

## 10. 合并或保留分支

初学阶段建议先保留分支，不急着合并。

如果确认没问题，可以切回 main：

```bat
git checkout main
```

合并 AI 分支：

```bat
git merge ai/你的任务名
```

风险提示：合并前必须确认 AI 分支已经测试过。

---

# 十、最小安全安装流程

这是最短路线，先跑通即可。

## 1. 检查环境

```bat
node -v
npm -v
git --version
where node
where npm
where git
```

作用：确认 Node.js、npm、Git 都能在命令行使用。

PowerShell 中如果 `where` 不正常，用：

```powershell
where.exe node
where.exe npm
where.exe git
```

---

## 2. 安装 OpenCode

```bat
npm i -g opencode-ai@latest
```

作用：安装 OpenCode 最新版。

---

## 3. 验证安装

```bat
opencode --version
where opencode
```

作用：确认 OpenCode 命令可用。

---

## 4. 创建安全测试项目

```bat
mkdir D:\AI-Code-Lab
mkdir D:\AI-Code-Lab\opencode-test
cd /d D:\AI-Code-Lab\opencode-test
echo # OpenCode Test Project > README.md
echo console.log("Hello OpenCode"); > app.js
echo .env > .gitignore
git init
git add README.md app.js .gitignore
git commit -m "baseline: initial safe state"
git checkout -b ai/opencode-test
```

作用：创建测试项目、初始化 Git、提交基线、进入 AI 分支。

---

## 5. 启动 OpenCode

```bat
opencode
```

进入后先输入：

```text
请只分析这个项目，不要修改文件。请列出最小修改计划。
```

---

## 6. 修改后必须审查

```bat
git status
git diff
git add -p
git commit -m "ai: safe OpenCode test change"
```

作用：查看改动、逐块确认、提交安全节点。

---

记住一句话：**OpenCode 负责帮你改，Git 负责帮你保命；不在 main 改、不看 diff 不 commit。**