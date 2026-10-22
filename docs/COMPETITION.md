# 2026 飞猪 AI 旅行创新大赛 · 提交说明

## 作品名

**TripBlocks** — A calmer way to plan a trip, block by block.

## 一句话

把旅行计划拆成可拖拽的模块，让 AI 和真实飞猪库存一起参与「这一周怎么过」，而不是再做一个聊天框。

## 用户与问题

自由行用户在规划 5–10 天城市旅行时，通常同时面对：跨天排期、交通衔接、预算、体力节奏、以及「看起来很多但无法决策」的搜索结果。传统行程表只能记录，不能帮助取舍。

TripBlocks 的目标不是生成一份一次性攻略，而是提供一个**可以持续调整的计划工作台**：每个块都有时间、地点、花费和备注；拖动即改变计划；AI 能读到完整上下文并给出局部修改；FlyAI 提供可直接预订的真实库存。

## 比赛要求映射

| 要求 | 实现 |
|---|---|
| 使用阿里云百炼 Managed Agent | `server.mjs` 通过 `bl managed-agent session run` 调用远程 Agent；`agent/agents.yaml` + `agents.state.json` 保存配置和资源状态 |
| 使用 Vault 管理凭证 | `agent/agents.yaml` 绑定 Vault；密钥不进入前端 |
| 使用 FlyAI Skill | 接入官方 `@fly-ai/flyai-cli`，服务端 `/api/flyai` 调用 `search-hotel` / `search-poi`；文档给出 `npx skills add alibaba-flyai/flyai-skill` |
| 真实酒店 / 景点 / 机票能力 | Live options 面板展示酒店、景点、图片、价格、评分与飞猪预订链接 |
| 可演示产品 | React + Vite + Tailwind，完整 board / map / budget / live inventory / AI companion |
| 可运行、可复现 | `npm install && npm run dev:all`；FlyAI Key 用 CLI 配置；无需把 Key 写进仓库 |

## 核心演示路径（3 分钟）

1. 打开首页：7 天 Kansai 计划板；看总预算、节奏和「Day 5 结束太晚」的冲突提示。
2. 拖动 Day 1 的「Nishiki market crawl」到 Day 3；计划与每日成本即时更新。
3. 点 **Live options** → **Stays**：看到 FlyAI 返回的京都酒店、图片、价格和飞猪链接；选择 Day 5，加入计划。
4. 点 **Wander** 快捷问题「Make Day 5 lighter」：Managed Agent 读取当前计划，给出具体调整，并以建议块呈现；一键加入。
5. 切换 **Route map** / **Budget**：确认路线、每日消费与剩余预算。

## 技术架构

```text
Browser (React 19 / Vite / Tailwind v4 / dnd-kit)
   │  fetch /api/agent  /api/flyai
   ▼
Local Node server (server.mjs)
   ├─ bl managed-agent session run  → 百炼 Managed Agent
   └─ node_modules/.bin/flyai        →  FlyAI / 飞猪 MCP
```

- **前端无密钥**：API Key 只在服务端 / CLI 配置中。
- **Agent 调用是用户触发的单次请求**，没有轮询；会话空闲不产生运行时费。
- **本地 fallback**：Agent 不可用时，服务端可回退到本地 OCX 模型；设置 `AGENT_FALLBACK=off` 可关闭。前端网络失败时仍使用不调用模型的确定性草稿。
- **FlyAI 结果 10 分钟缓存**，减少重复请求。
- **状态持久化**：`localStorage` 保存行程；刷新不丢。

## 设计取舍

- 不做全屏地图 + 侧边聊天的常规组合，而是让计划板成为主画布。
- 不使用高饱和渐变或大面积玻璃拟态；表面靠明度阶梯和发丝边分层。
- AI 不自动改行程；建议先以卡片呈现，用户确认后才写入，避免「黑箱规划」。

## 已知限制 / 下一步

- Live 价格以 CNY 返回，加入 JPY 行程时按固定汇率估算，并在备注中标明。
- 真实下单、多人协作、航班实时余票未接入。
- Managed Agent 的模型权限依赖百炼账号；无权限时演示走本地草稿，FlyAI 库存仍可独立工作。
