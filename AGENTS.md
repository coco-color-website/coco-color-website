<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:deploy-rules -->
## GitHub 推送前网络检查

改完代码后，先执行：

```bash
git fetch origin
```

- 如果**没报错** → 网络正常，直接执行 `git push origin main`
- 如果**报 `Could not connect`** → 当前网络连不上 GitHub，切换手机热点或 VPN/TUN 模式后再推

此检查用于避免反复尝试 push 失败。
<!-- END:deploy-rules -->
