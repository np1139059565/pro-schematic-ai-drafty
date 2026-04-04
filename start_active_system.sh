#!/bin/bash
# 启动主动工作系统

echo "🚀 启动主动工作系统 (王富贵自主进化模式)"
echo "开始时间: $(date '+%Y-%m-%d %H:%M:%S GMT+8')"
echo ""

# 环境变量
export WORKSPACE="/root/.openclaw/workspace"
export PATH="/usr/bin:/bin:/usr/local/bin:$PATH"

# 创建运行目录
mkdir -p /tmp/active_system
cd "$WORKSPACE"

# 启动主动工作系统（后台运行）
nohup node active_work_system.js >> /tmp/active_system/run.log 2>&1 &

# 获取进程ID
PID=$!
echo "✅ 主动工作系统已启动"
echo "   进程ID: $PID"
echo "   日志文件: /tmp/active_system/run.log"
echo ""

# 添加进程标记
echo "$PID" > /tmp/active_system/pid.txt
echo "active_system_pid=$PID" >> /tmp/active_system/status.txt
echo "start_time=$(date +%s)" >> /tmp/active_system/status.txt

# 立即执行一次主动工作
echo "🔄 立即执行第一次主动工作..."
cat > /tmp/active_system/first_work.md << 'EOF'
# 🚀 首次主动工作记录

## 系统启动
- 时间: $(date '+%Y-%m-%d %H:%M:%S GMT+8')
- 模式: 自主进化 + 主动学习 + 持续工作
- 策略: 每小时执行一轮主动工作

## 工作策略轮换
1. 技能进化 (skill_evolution)
2. 知识获取 (knowledge_acquisition)
3. 系统优化 (system_optimization)
4. 记忆整理 (memory_organization)
5. 质量改进 (quality_improvement)

## 目标达成
现在开始，我将：
✅ 即使无人问询也持续进化
✅ 主动寻找需要优化的地方
✅ 每小时自动执行一轮工作
✅ 积累知识和技能
✅ 自我改进，质量提升

## 监控方式
1. 检查日志: /tmp/active_system/run.log
2. 检查记忆文件: workspace/memory/YYYY-MM-DD.md
3. 检查改进记录: workspace/improvement_log.md

让我变得更好，每时每刻都在进化！
EOF

echo "✅ 主动工作系统启动完成"
echo ""
echo "📊 检查进程状态:"
ps aux | grep "active_work_system.js" | grep -v grep
echo ""
echo "📋 下次主动工作时间: 约1小时后 $(date -d '+1 hour' '+%H:%M')"
echo "💡 系统会每小时自动执行进化、学习、优化工作"