# gentusu — 项目上下文

## 这是什么
Genjutsu（genjutsusi.app）前端：7 个视频特效模式（motion/character/outfit/object/background/restyle/face swap）+ 191 个模板 + 试听音频。后端复用 kinkora。

## 技术栈
```
Frontend: Vite + React + TypeScript + Tailwind
```

## 常用命令
```bash
本地: corepack yarn dev   (在 frontend/)
构建: corepack yarn build  (只认 build，LSP 的 PnP 报错是假阳性)
```

## 目录地图
```
frontend/src/config/site.ts       模式定义、prompt 编排、计价
frontend/src/config/templates.ts  模板加载与音频分类
frontend/src/data/templates.json  模板数据
frontend/src/components/studio    Studio 主界面、模板选择器、对比滑杆
scripts/build_templates.py        模板构建脚本
```

## 项目约束 / 常见坑
- 模板数据改动必须同时改 scripts/build_templates.py，否则下次构建被覆盖
- 模板 audio 字段必须是 ffprobe 实测值
- 计费口径以 kinkora config/pricing_kinkora.yaml 为准
- 静态资源域名 storage.genjutsusi.app

## 协作规则（对所有项目适用）

- 没有明确要求时：不要 commit / push / 部署 / 删文件；改完先给 diff 与验证结果。
- 改线上行为前先证明问题存在（日志/复现），再动手；不要凭猜测重构。
- 验证只认事实：`npm run build` 通过、`pytest` 通过、接口实际返回；不写"应该可以"。
- 本地 Python 统一用 `~/miniconda3/envs/kin/bin/python`（或 `conda activate kin`），不要新建 venv。
- 出网（AWS/GCS/R2/GitHub/npm 慢）可走代理 `http://127.0.0.1:51081`；本机 127.0.0.1 请求要 `--noproxy '*'`。
- 密钥只在 .env / 平台注入里，不要写进代码或文档。


## 需要深入时
优先读本目录的 `README.md` 和 `docs/`；只有确实要改架构时才通读代码，不要一上来全仓扫描。
