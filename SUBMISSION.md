# TripBlocks — 比赛提交信息（草稿）

- **作品名**：TripBlocks
- **一句话**：把旅行计划拆成可拖拽的模块，让 AI 和真实飞猪库存一起参与「这一周怎么过」。
- **赛道**：自由方向 / AI × 旅行（按报名页最终选择）
- **GitHub**：https://github.com/37chengshan/tripblocks
- **提交 Issue**：https://github.com/modelstudioai/modelstudioai.github.io/issues/203
- **Demo 视频**：https://github.com/37chengshan/tripblocks/raw/main/docs/demo/tripblocks-demo.mp4
- **演示**：`npm install && npm run dev:all`，打开 `http://127.0.0.1:5173`
- **核心能力**：7 天模块化 board、跨天拖拽、FlyAI 实时酒店/景点、Wander Managed Agent、路线/预算视图
- **Agent**：阿里云百炼 Managed Agent（`agent/agents.yaml`），Vault 绑定，前端不接触密钥
- **FlyAI**：官方 `@fly-ai/flyai-cli`，`server.mjs` 的 `/api/flyai`
- **封面**：`docs/screenshots/cover-3x4.png`
- **截图**：`docs/screenshots/home.png`、`flyai-stays.png`、`mobile-home.png`
- **已知限制**：百炼控制台当前没有 API Key；Managed Agent 实时回答需补 Key；Live FlyAI 已可用

> 提交前请补：团队名、联系人、GitHub/部署链接、演示视频链接。
