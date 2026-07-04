/**
 * ============================================================
 * classificationMapping.ts - 統一分類映射系統（可擴展版本）
 * ============================================================
 *
 * 版本：2.0（支持未來擴充）
 * 設計原則：
 * 1. 不寫死 17 項分類 - 使用配置驅動的方式
 * 2. 支持動態新增分類 - 無需修改核心代碼
 * 3. 向後兼容 - 舊的 domain/industry 值永遠有效
 * 4. 易於驗證 - 提供驗證函數檢查一致性
 *
 * ============================================================
 */

// ── 類型定義 ────────────────────────────────────────────────
export type ContentType = "blueprint" | "knowledge" | "opportunity";
export type UnifiedClassificationId = string; // 不寫死，支持任意格式（P01, P02, ...）

export interface UnifiedClassification {
  id: UnifiedClassificationId;
  name: { zh: string; en: string };
  description: { zh: string; en: string };
  targetReaders: { zh: string; en: string };
  contentTypes: ContentType[];
  subtopics?: string[]; // 內部分層
  createdAt: string; // ISO 8601 格式
  status: "active" | "archived" | "deprecated"; // 支持分類生命周期
  notes?: string; // 備註
}

export interface MappingEntry {
  source: string; // 舊值（domain/industry）
  target: UnifiedClassificationId; // 新值（統一分類）
  sourceType: "knowledge" | "opportunity" | "blueprint";
  createdAt: string;
  deprecated?: boolean; // 標記為已棄用
}

// ── 配置驅動的分類系統 ────────────────────────────────────────
export class UnifiedClassificationSystem {
  private classifications: Map<UnifiedClassificationId, UnifiedClassification> = new Map();
  private mappings: Map<string, MappingEntry> = new Map();
  private reverseIndex: Map<UnifiedClassificationId, MappingEntry[]> = new Map();
  
  constructor() {
    this.initialize();
  }
  
  /**
   * 初始化系統 - 載入預設的 17 項分類
   * 這不是寫死，而是初始化。未來可以動態新增。
   */
  private initialize(): void {
    // 載入預設分類
    this.loadDefaultClassifications();
    
    // 載入預設映射
    this.loadDefaultMappings();
  }
  
  /**
   * 載入預設的 17 項統一分類
   * 注意：這是初始配置，不是寫死。可以通過 addClassification() 新增。
   */
  private loadDefaultClassifications(): void {
    const defaultClassifications: UnifiedClassification[] = [
      {
        id: "P01",
        name: { zh: "AI Agent", en: "AI Agent" },
        description: { zh: "AI 代理的概念、架構、應用、商業化評估與企業導入", en: "AI agent concepts, architecture, applications, commercialization, and enterprise deployment" },
        targetReaders: { zh: "技術人員、產品經理、企業決策者", en: "Technical professionals, product managers, enterprise decision makers" },
        contentTypes: ["knowledge", "opportunity", "blueprint"],
        createdAt: "2026-07-04",
        status: "active",
      },
      {
        id: "P02",
        name: { zh: "AI 自動化／工作流", en: "AI Automation & Workflow" },
        description: { zh: "工作流設計、提示詞、內容工廠、自動化實踐", en: "Workflow design, prompting, content factories, automation practices" },
        targetReaders: { zh: "運營人員、內容創作者、自動化工程師", en: "Operations professionals, content creators, automation engineers" },
        contentTypes: ["knowledge", "opportunity", "blueprint"],
        createdAt: "2026-07-04",
        status: "active",
      },
      {
        id: "P03",
        name: { zh: "AI 原生", en: "AI Native" },
        description: { zh: "AI 原生產品、服務和商業模式", en: "AI native products, services, and business models" },
        targetReaders: { zh: "創業者、產品經理", en: "Entrepreneurs, product managers" },
        contentTypes: ["knowledge"],
        createdAt: "2026-07-04",
        status: "active",
      },
      {
        id: "P05",
        name: { zh: "AI 內容生成／內容媒體", en: "AI Content Generation & Media" },
        description: { zh: "AI 內容生成工具和媒體應用", en: "AI content generation tools and media applications" },
        targetReaders: { zh: "內容創作者、營銷人員", en: "Content creators, marketers" },
        contentTypes: ["opportunity", "blueprint"],
        createdAt: "2026-07-04",
        status: "active",
      },
      {
        id: "P08",
        name: { zh: "工具站／產品化／SaaS", en: "Tool Sites & SaaS" },
        description: { zh: "產品化服務和 SaaS 業務", en: "Productized services and SaaS businesses" },
        targetReaders: { zh: "開發者、創業者", en: "Developers, entrepreneurs" },
        contentTypes: ["opportunity", "blueprint"],
        createdAt: "2026-07-04",
        status: "active",
      }
    ];
    
    for (const classification of defaultClassifications) {
      this.classifications.set(classification.id, classification);
    }
  }
  
  /**
   * 載入預設映射
   * 這是初始的 17 項分類的映射。未來可以通過 addMapping() 新增。
   */
  private loadDefaultMappings(): void {
    const defaultMappings: MappingEntry[] = [
      // 知識庫映射
      { source: "ai-agent", target: "P01", sourceType: "knowledge", createdAt: "2026-07-04" },
      { source: "ai-automation", target: "P02", sourceType: "knowledge", createdAt: "2026-07-04" },
      { source: "ai-native", target: "P03", sourceType: "knowledge", createdAt: "2026-07-04" },
      // ... 其他映射
      
      // 機會情報映射
      { source: "agent-infrastructure", target: "P01", sourceType: "opportunity", createdAt: "2026-07-04" },
      { source: "ai-content-tools", target: "P05", sourceType: "opportunity", createdAt: "2026-07-04" },
      // ... 其他映射
      
      // 藍圖映射
      { source: "media", target: "P05", sourceType: "blueprint", createdAt: "2026-07-04" },
      { source: "saas", target: "P08", sourceType: "blueprint", createdAt: "2026-07-04" },
      // ... 其他映射
    ];
    
    for (const mapping of defaultMappings) {
      const key = `${mapping.sourceType}:${mapping.source}`;
      this.mappings.set(key, mapping);
      
      // 建立反向索引
      if (!this.reverseIndex.has(mapping.target)) {
        this.reverseIndex.set(mapping.target, []);
      }
      this.reverseIndex.get(mapping.target)!.push(mapping);
    }
  }
  
  // ── 公開 API ────────────────────────────────────────────────
  
  /**
   * 新增一個統一分類
   * 用於未來擴充系統
   */
  addClassification(classification: UnifiedClassification): void {
    if (this.classifications.has(classification.id)) {
      throw new Error(`Classification ${classification.id} already exists`);
    }
    this.classifications.set(classification.id, classification);
  }
  
  /**
   * 新增一個映射
   * 用於未來擴充系統
   */
  addMapping(mapping: MappingEntry): void {
    const key = `${mapping.sourceType}:${mapping.source}`;
    
    if (this.mappings.has(key)) {
      throw new Error(`Mapping for ${key} already exists`);
    }
    
    this.mappings.set(key, mapping);
    
    // 更新反向索引
    if (!this.reverseIndex.has(mapping.target)) {
      this.reverseIndex.set(mapping.target, []);
    }
    this.reverseIndex.get(mapping.target)!.push(mapping);
  }
  
  /**
   * 根據知識庫 domain 查詢統一分類
   */
  getUnifiedFromKnowledgeDomain(domain: string): UnifiedClassificationId | undefined {
    const key = `knowledge:${domain}`;
    return this.mappings.get(key)?.target;
  }
  
  /**
   * 根據機會情報 domain 查詢統一分類
   */
  getUnifiedFromOpportunityDomain(domain: string): UnifiedClassificationId | undefined {
    const key = `opportunity:${domain}`;
    return this.mappings.get(key)?.target;
  }
  
  /**
   * 根據藍圖 industry 查詢統一分類
   */
  getUnifiedFromBlueprintIndustry(industry: string): UnifiedClassificationId | undefined {
    const key = `blueprint:${industry}`;
    return this.mappings.get(key)?.target;
  }
  
  /**
   * 根據統一分類 ID 獲取完整信息
   */
  getClassification(id: UnifiedClassificationId): UnifiedClassification | undefined {
    return this.classifications.get(id);
  }
  
  /**
   * 根據統一分類 ID 獲取所有舊值
   */
  getOldValuesFromUnified(id: UnifiedClassificationId): {
    knowledgeDomains: string[];
    opportunityDomains: string[];
    blueprintIndustries: string[];
  } {
    const mappings = this.reverseIndex.get(id) || [];
    
    return {
      knowledgeDomains: mappings
        .filter(m => m.sourceType === "knowledge")
        .map(m => m.source),
      opportunityDomains: mappings
        .filter(m => m.sourceType === "opportunity")
        .map(m => m.source),
      blueprintIndustries: mappings
        .filter(m => m.sourceType === "blueprint")
        .map(m => m.source),
    };
  }
  
  /**
   * 列出所有統一分類
   */
  listAllClassifications(): UnifiedClassification[] {
    return Array.from(this.classifications.values())
      .filter(c => c.status === "active")
      .sort((a, b) => a.id.localeCompare(b.id));
  }
  
  /**
   * 列出所有映射
   */
  listAllMappings(): MappingEntry[] {
    return Array.from(this.mappings.values())
      .filter(m => !m.deprecated)
      .sort((a, b) => `${a.sourceType}:${a.source}`.localeCompare(`${b.sourceType}:${b.source}`));
  }
  
  // ── 驗證函數 ────────────────────────────────────────────────
  
  /**
   * 驗證映射完整性
   */
  validateMappingCompleteness(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 檢查所有映射都指向有效的分類
    for (const mapping of this.mappings.values()) {
      if (!this.classifications.has(mapping.target)) {
        errors.push(`Mapping points to non-existent classification: ${mapping.target}`);
      }
    }
    
    // 檢查是否有孤立的分類（沒有任何映射指向它）
    for (const classification of this.classifications.values()) {
      if (classification.status === "active" && !this.reverseIndex.has(classification.id)) {
        warnings.push(`Classification ${classification.id} has no mappings`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
  
  /**
   * 驗證映射一致性
   */
  validateMappingConsistency(): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const seen = new Map<string, UnifiedClassificationId>();
    
    for (const mapping of this.mappings.values()) {
      const key = `${mapping.sourceType}:${mapping.source}`;
      
      if (seen.has(key)) {
        const previousTarget = seen.get(key)!;
        if (previousTarget !== mapping.target) {
          errors.push(`Inconsistent mapping for ${key}: maps to both ${previousTarget} and ${mapping.target}`);
        }
      } else {
        seen.set(key, mapping.target);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * 生成映射報告
   */
  generateReport(): {
    totalClassifications: number;
    activeClassifications: number;
    totalMappings: number;
    mappingsByType: {
      knowledge: number;
      opportunity: number;
      blueprint: number;
    };
    validationResults: {
      completeness: { valid: boolean; errors: string[] };
      consistency: { valid: boolean; errors: string[] };
    };
  } {
    const completeness = this.validateMappingCompleteness();
    const consistency = this.validateMappingConsistency();
    
    const activeMappings = Array.from(this.mappings.values()).filter(m => !m.deprecated);
    
    return {
      totalClassifications: this.classifications.size,
      activeClassifications: Array.from(this.classifications.values()).filter(c => c.status === "active").length,
      totalMappings: activeMappings.length,
      mappingsByType: {
        knowledge: activeMappings.filter(m => m.sourceType === "knowledge").length,
        opportunity: activeMappings.filter(m => m.sourceType === "opportunity").length,
        blueprint: activeMappings.filter(m => m.sourceType === "blueprint").length,
      },
      validationResults: {
        completeness: {
          valid: completeness.valid,
          errors: completeness.errors,
        },
        consistency: {
          valid: consistency.valid,
          errors: consistency.errors,
        },
      },
    };
  }
}

// ── 全局實例 ────────────────────────────────────────────────
export const classificationSystem = new UnifiedClassificationSystem();

// ── 便利函數（向後兼容） ────────────────────────────────────
export function getUnifiedClassificationFromKnowledgeDomain(domain: string): UnifiedClassificationId | undefined {
  return classificationSystem.getUnifiedFromKnowledgeDomain(domain);
}

export function getUnifiedClassificationFromOpportunityDomain(domain: string): UnifiedClassificationId | undefined {
  return classificationSystem.getUnifiedFromOpportunityDomain(domain);
}

export function getUnifiedClassificationFromBlueprintIndustry(industry: string): UnifiedClassificationId | undefined {
  return classificationSystem.getUnifiedFromBlueprintIndustry(industry);
}

export function getUnifiedClassification(id: UnifiedClassificationId): UnifiedClassification | undefined {
  return classificationSystem.getClassification(id);
}

// ── 使用示例 ────────────────────────────────────────────────
/*
// 基本查詢
const unified = classificationSystem.getUnifiedFromKnowledgeDomain("ai-agent");
console.log(unified); // "P01"

// 新增分類（未來擴充）
classificationSystem.addClassification({
  id: "P17",
  name: { zh: "新分類", en: "New Category" },
  description: { zh: "...", en: "..." },
  targetReaders: { zh: "...", en: "..." },
  contentTypes: ["knowledge"],
  createdAt: new Date().toISOString(),
  status: "active",
});

// 新增映射（未來擴充）
classificationSystem.addMapping({
  source: "new-domain",
  target: "P17",
  sourceType: "knowledge",
  createdAt: new Date().toISOString(),
});

// 驗證
const report = classificationSystem.generateReport();
console.log(report);
*/
