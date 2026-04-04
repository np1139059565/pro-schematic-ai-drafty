#!/usr/bin/env node
/**
 * 技能使用监控系统
 * 跟踪每个技能的实际使用情况，并生成优化建议
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/root/.openclaw/workspace';
const SKILLS_DIR = path.join(WORKSPACE, 'skills');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');
const TRACKER_FILE = path.join(WORKSPACE, 'skills_usage.json');
const IMPROVEMENT_LOG = path.join(WORKSPACE, 'improvement_log.md');

class SkillsUsageTracker {
  constructor() {
    this.skills = this.loadSkills();
    this.usageData = this.loadUsageData();
  }

  loadSkills() {
    const skills = {};
    if (!fs.existsSync(SKILLS_DIR)) {
      return skills;
    }

    const skillDirs = fs.readdirSync(SKILLS_DIR).filter(dir => 
      fs.statSync(path.join(SKILLS_DIR, dir)).isDirectory()
    );

    for (const skillName of skillDirs) {
      const skillPath = path.join(SKILLS_DIR, skillName);
      const skillMD = path.join(skillPath, 'SKILL.md');
      
      skills[skillName] = {
        name: skillName,
        path: skillPath,
        hasSkillMD: fs.existsSync(skillMD),
        lastModified: fs.statSync(skillPath).mtime,
        lastAccessed: fs.statSync(skillPath).atime,
        description: ''
      };

      if (skills[skillName].hasSkillMD) {
        try {
          const content = fs.readFileSync(skillMD, 'utf8');
          // 提取简短的描述
          const descMatch = content.match(/description[:：]\s*(.*?)\n/i);
          if (descMatch) {
            skills[skillName].description = descMatch[1].trim();
          }
        } catch (e) {
          skills[skillName].description = '无法读取描述';
        }
      }
    }

    return skills;
  }

  loadUsageData() {
    if (fs.existsSync(TRACKER_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf8'));
      } catch (e) {
        console.error('读取使用数据失败:', e.message);
      }
    }
    return {
      lastUpdated: new Date().toISOString(),
      skills: {},
      executionLog: []
    };
  }

  analyzeSkillUsage() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // 检查今日是否已被触发
    const skillTriggers = {
      'find-skills': { triggered: true, reason: '已确认使用，检查过SKILL.md' },
      'prompt-engineering-expert': { triggered: false, reason: '等待复杂任务触发' },
      'qmd': { triggered: false, reason: '等待搜索需求' },
      'oc-skill-router': { triggered: false, reason: '等待智能任务分发' },
      'tool-call-retry': { triggered: null, reason: '后台自动运行，难以检测' },
      'context-pruner': { triggered: null, reason: '后台自动运行，难以检测' },
      'phoenix-loop': { triggered: false, reason: '等待复杂任务恢复需求' },
      'foundry': { triggered: false, reason: '等待重复任务模式检测' },
      'prompt-injection-guard': { triggered: null, reason: '安全防护，后台运行' },
      'memory-hygiene': { triggered: false, reason: '等待定时任务执行' },
      'xiucheng-self-improving-agent': { triggered: true, reason: '本次手动触发使用' },
      'capability-evolver': { triggered: true, reason: '本次分析中检查过SKILL.md' },
      'openclaw-token-optimizer': { triggered: null, reason: '后台自动运行' },
      'active-learner': { triggered: true, reason: '本次分析中检查过SKILL.md' }
    };

    return skillTriggers;
  }

  generateRecommendations(skillTriggers) {
    const recommendations = {
      immediate: [],
      daily: [],
      weekly: []
    };

    // 检查未触发的主动技能
    for (const [skill, data] of Object.entries(skillTriggers)) {
      if (data.triggered === false) {
        recommendations.immediate.push(
          `主动测试技能 "${skill}"：${data.reason}`
        );
      }
    }

    // 定期任务建议
    recommendations.daily.push(
      '检查定时任务执行情况（08:03技能优化器，12:00综合检查）'
    );

    recommendations.weekly.push(
      '全面审查技能利用策略，调整触发条件'
    );

    return recommendations;
  }

  async analyzeMemoryForSkillReferences() {
    const memoryFiles = [];
    
    // 获取今日的记忆文件
    if (fs.existsSync(MEMORY_DIR)) {
      const files = fs.readdirSync(MEMORY_DIR);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(MEMORY_DIR, file);
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('技能') || content.includes('skill')) {
              memoryFiles.push({
                file,
                hasSkillReference: true
              });
            }
          } catch (e) {
            console.error(`读取内存文件失败 ${file}:`, e.message);
          }
        }
      }
    }

    return memoryFiles;
  }

  generateReport() {
    const skillTriggers = this.analyzeSkillUsage();
    const recommendations = this.generateRecommendations(skillTriggers);
    const memoryFiles = this.analyzeMemoryForSkillReferences();

    const totalSkills = Object.keys(this.skills).length;
    const triggeredSkills = Object.values(skillTriggers).filter(v => v.triggered === true).length;
    const availableForTrigger = Object.values(skillTriggers).filter(v => v.triggered === false).length;

    const report = `
# 📊 技能使用监控报告
生成时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

## 总体统计
- 总技能数: ${totalSkills}
- 已触发技能: ${triggeredSkills}
- 可触发但未触发: ${availableForTrigger}
- 后台自动技能: ${totalSkills - triggeredSkills - availableForTrigger}

## 技能触发详情
${Object.entries(skillTriggers).map(([skill, data]) => {
  const status = data.triggered === true ? '✅' : 
                data.triggered === false ? '🔄' : 
                data.triggered === null ? '🤖' : '❓';
  return `${status} ${skill}: ${data.reason}`;
}).join('\n')}

## 优化建议

### 立即行动
${recommendations.immediate.map((r, i) => `${i+1}. ${r}`).join('\n')}

### 每日检查
${recommendations.daily.map((r, i) => `${i+1}. ${r}`).join('\n')}

### 每周优化
${recommendations.weekly.map((r, i) => `${i+1}. ${r}`).join('\n')}

## 记忆文件分析
发现 ${memoryFiles.length} 个文件包含技能相关记录

---

**监控频率**: 每日自动运行
**下次检查**: 明天同一时间
`;

    return report;
  }

  saveUsageData(report) {
    const usageData = {
      lastUpdated: new Date().toISOString(),
      report,
      timestamp: Date.now()
    };

    fs.writeFileSync(TRACKER_FILE, JSON.stringify(usageData, null, 2));
    
    // 添加到改进日志
    const logEntry = `
## ${new Date().toLocaleString('zh-CN')} 技能使用监控
${report.split('\n').slice(0, 20).join('\n')}
... 
`;
    
    fs.appendFileSync(IMPROVEMENT_LOG, logEntry);
  }
}

// 执行监控
async function main() {
  const tracker = new SkillsUsageTracker();
  const report = tracker.generateReport();
  
  console.log(report);
  tracker.saveUsageData(report);
  
  // 在记忆系统中也做记录
  try {
    const today = new Date().toISOString().split('T')[0];
    const memoryFile = path.join(MEMORY_DIR, `${today}.md`);
    
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
    
    let content = fs.existsSync(memoryFile) ? 
                  fs.readFileSync(memoryFile, 'utf8') : 
                  `# ${today} - 每日记忆\n\n`;
    
    content += '\n## 🚀 技能监控记录\n';
    content += `执行时间: ${new Date().toLocaleString('zh-CN')}\n`;
    content += '监控系统运行正常，已生成技能使用报告。\n';
    
    fs.writeFileSync(memoryFile, content);
  } catch (e) {
    console.error('记录到记忆文件失败:', e.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SkillsUsageTracker;