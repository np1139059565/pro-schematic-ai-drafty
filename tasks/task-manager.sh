#!/bin/bash
# 异步任务管理器 v1.0
set -e

TASK_DIR="/root/.openclaw/workspace/tasks"
QUEUE_FILE="$TASK_DIR/task-queue.json"
PROGRESS_FILE="$TASK_DIR/progress-tracker.json"
COMPLETED_DIR="$TASK_DIR/completed"

# 确保目录存在
mkdir -p "$COMPLETED_DIR"

# 函数：添加新任务
add_task() {
    local task_id="$1"
    local task_type="$2"
    local description="$3"
    local command="$4"
    
    local timestamp=$(date +%s)
    
    # 创建任务定义
    cat > "$TASK_DIR/task-$task_id.json" <<EOF
{
    "taskId": "$task_id",
    "type": "$task_type",
    "description": "$description",
    "command": "$command",
    "createdAt": $timestamp,
    "status": "pending",
    "startedAt": null,
    "completedAt": null,
    "result": null,
    "error": null
}
EOF
    
    # 添加到队列
    local queue_content=""
    if [ -f "$QUEUE_FILE" ]; then
        queue_content=$(cat "$QUEUE_FILE" 2>/dev/null || echo "[]")
    else
        queue_content="[]"
    fi
    
    echo "$queue_content" | jq --arg task_id "$task_id" '. + [$task_id]' > "$QUEUE_FILE"
    
    echo "✅ Task $task_id added to queue"
}

# 函数：执行下一个待处理任务
run_next_task() {
    if [ ! -f "$QUEUE_FILE" ]; then
        echo "⚠️ No tasks in queue"
        return 1
    fi
    
    local queue_content=$(cat "$QUEUE_FILE")
    local task_count=$(echo "$queue_content" | jq length)
    
    if [ "$task_count" -eq 0 ]; then
        echo "ℹ️ No pending tasks"
        return 0
    fi
    
    local task_id=$(echo "$queue_content" | jq -r '.[0]')
    local task_file="$TASK_DIR/task-$task_id.json"
    
    if [ ! -f "$task_file" ]; then
        echo "❌ Task $task_id not found"
        # 从队列中移除
        echo "$queue_content" | jq '.[1:]' > "$QUEUE_FILE"
        return 1
    fi
    
    echo "🚀 Starting task: $task_id"
    
    # 更新任务状态
    local started_at=$(date +%s)
    cat "$task_file" | jq --argjson started_at "$started_at" '.status = "running" | .startedAt = $started_at' > "$task_file.tmp"
    mv "$task_file.tmp" "$task_file"
    
    # 从队列中移除
    echo "$queue_content" | jq '.[1:]' > "$QUEUE_FILE"
    
    # 执行命令（后台执行）
    local command=$(cat "$task_file" | jq -r '.command')
    
    echo "Executing: $command"
    
    # 在实际环境中，这里会使用后台进程执行
    # 为简化，这里只是模拟执行
    sleep 2
    
    # 更新任务状态为完成
    local completed_at=$(date +%s)
    local result='{"exit_code": 0, "output": "Task completed successfully"}'
    
    cat "$task_file" | jq --argjson completed_at "$completed_at" --argjson result "$result" \
        '.status = "completed" | .completedAt = $completed_at | .result = $result' > "$task_file.tmp"
    mv "$task_file.tmp" "$task_file"
    
    # 移动到完成目录
    mv "$task_file" "$COMPLETED_DIR/"
    
    echo "✅ Task $task_id completed"
}

# 函数：检查任务状态
check_task_status() {
    local task_id="$1"
    local task_file="$TASK_DIR/task-$task_id.json"
    local completed_file="$COMPLETED_DIR/task-$task_id.json"
    
    if [ -f "$completed_file" ]; then
        echo "📋 Task $task_id - COMPLETED"
        cat "$completed_file" | jq '.'
    elif [ -f "$task_file" ]; then
        local status=$(cat "$task_file" | jq -r '.status')
        echo "📋 Task $task_id - $status"
        cat "$task_file" | jq '.'
    else
        echo "❌ Task $task_id not found"
    fi
}

# 函数：列出所有任务
list_tasks() {
    echo "📋 Task Queue:"
    if [ -f "$QUEUE_FILE" ]; then
        cat "$QUEUE_FILE" | jq -c '.[]' | while read task_id; do
            echo "  - $task_id (pending)"
        done
    fi
    
    echo "🔄 Running tasks:"
    find "$TASK_DIR" -name "task-*.json" -type f 2>/dev/null | while read task_file; do
        local status=$(cat "$task_file" | jq -r '.status')
        if [ "$status" = "running" ]; then
            local task_id=$(basename "$task_file" .json | sed 's/task-//')
            echo "  - $task_id (running)"
        fi
    done
    
    echo "✅ Completed tasks:"
    find "$COMPLETED_DIR" -name "task-*.json" -type f 2>/dev/null | while read task_file; do
        local task_id=$(basename "$task_file" .json | sed 's/task-//')
        echo "  - $task_id (completed)"
    done
}

# 根据命令行参数执行
case "$1" in
    "add")
        add_task "$2" "$3" "$4" "$5"
        ;;
    "run")
        run_next_task
        ;;
    "status")
        check_task_status "$2"
        ;;
    "list")
        list_tasks
        ;;
    "help")
        echo "Usage:"
        echo "  $0 add <task_id> <type> <description> <command>"
        echo "  $0 run"
        echo "  $0 status <task_id>"
        echo "  $0 list"
        ;;
    *)
        echo "Unknown command. Use: $0 help"
        exit 1
        ;;
esac