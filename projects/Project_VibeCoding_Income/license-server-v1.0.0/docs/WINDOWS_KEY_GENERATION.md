# Windows 远程生成 License Key

推荐脚本：`scripts/clipmate_license_admin.py`

兼容脚本：`scripts/New-ClipMateLicense.ps1`

两种方式都通过 Windows OpenSSH 连接生产服务器，在服务器端调用正式 CLI，
校验返回格式后将 Key 写入 Windows 文件。默认不会在终端或 GUI 显示完整 Key。

## 前置条件

1. Windows 已安装 OpenSSH Client，`ssh.exe` 可用。
2. `~/.ssh/config` 中的 `codexconnected` 可以使用 SSH Key 无密码登录服务器。
3. 当前 SSH 用户能够读取 `/etc/license-server/license-server.env` 并访问正式数据库；
   当前生产配置使用 root 登录。
4. 推荐方式需要 Python 3.11 或更高版本；GUI 还需要安装时勾选标准库 Tkinter。

先验证连接：

```powershell
ssh -o BatchMode=yes codexconnected "systemctl is-active license-server"
```

## 推荐：打开 GUI

在项目目录运行：

```powershell
python .\license-server-v1.0.0\scripts\clipmate_license_admin.py gui
```

也可以直接双击 `scripts/ClipMate-License-GUI.pyw`。GUI 支持配置 SSH 目标、
输出目录、套餐、设备数、有效期和备注。切换到 Lifetime 时会自动禁用有效期，
生成过程在后台线程运行，窗口不会卡住。

不带参数时也会默认打开 GUI：

```powershell
python .\license-server-v1.0.0\scripts\clipmate_license_admin.py
```

## 推荐：Python 命令行生成 Pro Key

在项目目录运行：

```powershell
python .\license-server-v1.0.0\scripts\clipmate_license_admin.py create `
  --plan pro `
  --devices 1 `
  --days 365 `
  --remark "customer-order-001"
```

未指定 `-Days` 时，Pro 默认有效期为 30 天。Key 默认保存到：

```text
%USERPROFILE%\Documents\ClipMate-Licenses\clipmate-pro-<UTC时间>-<随机后缀>.txt
```

该文件只包含完整 Key，并通过 ACL 限制为当前 Windows 用户和 SYSTEM 可读写。

## Python 命令行生成 Lifetime Key

Lifetime 不允许设置 `-Days`：

```powershell
python .\license-server-v1.0.0\scripts\clipmate_license_admin.py create `
  --plan lifetime `
  --devices 2 `
  --remark "customer-order-002"
```

## 自定义连接和输出目录

```powershell
python .\license-server-v1.0.0\scripts\clipmate_license_admin.py create `
  --ssh-target codexconnected `
  --output-directory "D:\Secure\ClipMate-Licenses" `
  --plan pro --devices 3 --days 90 --remark "team-license"
```

Python CLI 和 GUI 都只显示掩码 Key 与文件路径。完整 Key 只写入 ACL 受限文件，
没有显示或复制完整 Key 的开关。

## 保留的 PowerShell 命令

原 PowerShell 脚本继续受支持：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File `
  ".\license-server-v1.0.0\scripts\New-ClipMateLicense.ps1" `
  -Plan pro -Devices 1 -Days 365 -Remark "customer-order-001"
```

### 返回到 PowerShell 变量

只有确实需要在后续脚本中使用完整 Key 时才启用 `-PassThru`：

```powershell
$result = .\license-server-v1.0.0\scripts\New-ClipMateLicense.ps1 `
  -Plan pro -Devices 1 -Days 30 -Remark "internal-test" -PassThru

$result.OutputPath
$result.LicenseKey
```

最后一行会把完整 Key 显示在终端和终端历史中，日常人工发放建议直接打开
`OutputPath` 对应的受限文件。

### PowerShell 自定义连接和输出目录

```powershell
.\license-server-v1.0.0\scripts\New-ClipMateLicense.ps1 `
  -SshTarget codexconnected `
  -OutputDirectory "D:\Secure\ClipMate-Licenses" `
  -Plan pro -Devices 3 -Days 90 -Remark "team-license"
```

两套脚本都会拒绝交互式密码登录、非法 SSH target、超过 20 台设备、超过 3650 天、
超过 200 字符的备注，以及与请求不一致或格式异常的服务器输出。
如果服务器已生成 Key、但 Windows 文件创建或 ACL 设置失败，脚本会自动在服务器
吊销该 Key，避免产生未交付却仍然有效的许可证。

不要将生成目录同步到公开网盘、Git、工单或聊天记录。需要吊销时，在服务器执行：

```bash
cd /opt/license-server/current
set -a; . /etc/license-server/license-server.env; set +a
/opt/license-server/venv/bin/python generate_key.py revoke XXXX-XXXX-XXXX-XXXX
```
