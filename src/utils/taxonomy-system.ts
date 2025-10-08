/**
 * 分类系统 - 统一处理标签和分类的树形结构
 * 核心改进：
 * 1. 删除了无用的泛型
 * 2. 直接使用对象引用，性能最优
 * 3. 代码极度简化
 * 注意：postIds 只存储直接属于该节点的文章ID，不包含子节点的文章
 *      count 字段存储包含所有子孙节点的去重文章总数
 */

import type { Post } from '@/types/content';
import type { TaxonomyNode, TaxonomyStats } from '@/types/utils';

export class TaxonomySystem {
  protected nodes: Map<string, TaxonomyNode>;
  protected rootNode: TaxonomyNode;  // 虚拟根节点，统一所有的树结构

  constructor() {
    // 初始化节点映射表
    this.nodes = new Map<string, TaxonomyNode>();

    // 创建虚拟根节点（不加入 nodes Map，仅内部使用）
    this.rootNode = {
      name: '__ROOT__',
      path: '',  // 空路径表示根
      level: 0,
      parentNode: undefined,
      childNodes: new Set<TaxonomyNode>(),
      postIds: new Set<string>(),  // 存放无分类/无标签的文章
      count: 0,
    };
  }

  /**
   * 从路径构建节点树（极简版）
   */
  protected buildFromPath(path: string, posts: Post[] = []): void {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return;

    let currentPath = '';
    let parentNode: TaxonomyNode | undefined;

    segments.forEach((segment, i) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      let node = this.nodes.get(currentPath);
      if (!node) {
        // 创建新节点
        node = this.createNode(segment, currentPath, i + 1);
        node.parentNode = parentNode ?? this.rootNode;  // 第一级节点的父节点是虚拟根
        // 注意：childNodes 和 postIds 已在 createNode 中初始化，无需重复赋值

        this.nodes.set(currentPath, node);

        // 建立父子关系
        if (parentNode) {
          parentNode.childNodes.add(node);
        } else {
          // 第一级节点添加到根节点
          this.rootNode.childNodes.add(node);
        }
      }

      /**
       * 关键设计：只在叶子节点（最深层路径）添加文章ID
       * 原因：
       * 1. 语义清晰 - postIds 表示"直接属于"而非"包含于"
       * 2. 避免冗余 - 父节点不重复存储子节点的文章
       * 3. 精确查询 - 可区分 "Frontend通用文章" 和 "Frontend/React专属文章"
       *
       * 示例：文章标记为 'Frontend/React'
       * - 只添加到 'Frontend/React' 节点
       * - 不添加到 'Frontend' 节点
       */
      if (i === segments.length - 1) {
        posts.forEach(post => node.postIds.add(post.id));
      }

      parentNode = node;
    });
  }

  /**
   * 创建新节点 - 不再是抽象方法
   */
  protected createNode(name: string, path: string, level: number): TaxonomyNode {
    return {
      name,
      path,
      level,
      parentNode: undefined,
      childNodes: new Set<TaxonomyNode>(),
      postIds: new Set<string>(),
      count: 0,  // 初始化为 0，后续通过 calculateAllCounts 更新
    };
  }

  /**
   * 标准化输入路径
   */
  protected normalizePath(input: string): string | null {
    if (!input) return null;
    return input
      .replace(/[\\/]+/g, '/')
      .replace(/^\/+|\/+$/g, '')
      .trim();
  }

  /**
   * 获取节点 - 直接返回，不需要转换
   */
  getNode(path: string): TaxonomyNode | null {
    return this.nodes.get(path) ?? null;
  }

  /**
   * 获取所有节点
   */
  getAllNodes(): TaxonomyNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * 获取根节点（虚拟根的直接子节点）
   */
  getRootNodes(): TaxonomyNode[] {
    return Array.from(this.rootNode.childNodes);
  }

  /**
   * 获取节点总数
   */
  getTotalCount(): number {
    return this.nodes.size;
  }

  /**
   * 获取无分类文章数量
   */
  getUncategorizedCount(): number {
    return this.rootNode.postIds.size;
  }

  /**
   * 获取所有文章总数（去重后）
   */
  getTotalUniquePostCount(): number {
    return this.rootNode.count;
  }

  /**
   * 获取热门节点
   * 按 count 排序（包含子节点的总文章数）
   * 热门分类应该反映整体规模而不只是直接文章数
   */
  getPopularNodes(limit = 10): TaxonomyNode[] {
    return Array.from(this.nodes.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 按直接文章数排序（不包含子节点）
   * 使用 postIds.size 而非递归 count
   */
  getNodesSortedByCount(): TaxonomyNode[] {
    return Array.from(this.nodes.values())
      .sort((a, b) => b.postIds.size - a.postIds.size);
  }

  /**
   * 搜索节点
   */
  searchNodes(query: string): TaxonomyNode[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.nodes.values())
      .filter(node =>
        node.name.toLowerCase().includes(lowerQuery)
        || node.path.toLowerCase().includes(lowerQuery),
      );
  }

  /**
   * 获取祖先节点 - 直接遍历引用，超快
   * 注意：不包含虚拟根节点
   */
  getAncestors(nodePath: string): TaxonomyNode[] {
    const node = this.nodes.get(nodePath);
    if (!node) return [];

    const ancestors: TaxonomyNode[] = [];
    let current = node.parentNode;

    // 遍历到虚拟根前停止
    while (current && current !== this.rootNode) {
      ancestors.unshift(current);
      current = current.parentNode;
    }

    return ancestors;
  }

  /**
   * 获取兄弟节点 - 直接从父节点获取
   */
  getSiblings(nodePath: string): TaxonomyNode[] {
    const node = this.nodes.get(nodePath);
    // 统一处理：不管父节点是虚拟根还是普通节点，逻辑完全一样
    if (!node?.parentNode) return [];
    return Array.from(node.parentNode.childNodes).filter(n => n.path !== nodePath);
  }

  /**
   * 获取子节点 - 直接返回
   */
  getChildren(nodePath: string): TaxonomyNode[] {
    const node = this.nodes.get(nodePath);
    if (!node) return [];
    return Array.from(node.childNodes);
  }

  /**
   * 获取相关节点（兄弟节点按直接文章数排序）
   * 注意：这只是获取排序后的兄弟节点，不是真正的"相关性"算法
   * 保留此方法仅为向后兼容，建议直接使用 getSiblings
   */
  getRelatedNodes(nodePath: string): TaxonomyNode[] {
    return this.getSiblings(nodePath)
      .sort((a, b) => b.postIds.size - a.postIds.size);
  }

  /**
   * 获取完整路径数组
   */
  getFullPath(nodePath: string): string[] {
    const parts = nodePath.split('/').filter(Boolean);
    return parts.map((_, i) => parts.slice(0, i + 1).join('/'));
  }


  /**
   * 获取标签云数据 - 从 TagSystem 移过来的唯一有用功能
   */
  getTagCloud(minCount = 1): TaxonomyNode[] {
    return this.getNodesSortedByCount()
      .filter(node => node.postIds.size >= minCount);
  }

  /**
   * 获取统计信息
   * 使用虚拟根节点的 count 获取真实的去重文章总数
   */
  getBaseStats(): TaxonomyStats {
    // 真实节点数（nodes 不包含虚拟根）
    const realNodeCount = this.nodes.size;

    // 使用虚拟根节点的 count 作为真实的去重文章总数
    const uniquePostCount = this.rootNode.count;

    // 平均每个节点分担的文章数（总文章数 / 节点数）
    // 这个值表示文章在节点间的分布密度
    const averagePostsPerNode = realNodeCount > 0
      ? uniquePostCount / realNodeCount
      : 0;

    // 获取最大层级（nodes 可能为空）
    const allNodes = Array.from(this.nodes.values());
    const maxLevel = allNodes.length > 0
      ? Math.max(...allNodes.map(n => n.level))
      : 0;

    return {
      totalNodes: realNodeCount,
      maxLevel,
      averagePostsPerNode,  // 文章分布密度
      topNodes: this.getPopularNodes(5),
    };
  }

  /**
   * 清空数据（重置根节点）
   */
  clear(): void {
    this.nodes.clear();
    // 重新创建根节点（不加入 nodes Map）
    this.rootNode = {
      name: '__ROOT__',
      path: '',
      level: 0,
      parentNode: undefined,
      childNodes: new Set<TaxonomyNode>(),
      postIds: new Set<string>(),
      count: 0,
    };
  }

  /**
   * 递归计算所有节点的 count（包含子孙节点的去重文章总数）
   * 使用后序遍历确保子节点先计算，父节点后计算
   * 临时 Set 用完即释放，避免内存浪费
   */
  private calculateAllCounts(): void {
    // 后序遍历递归函数
    const calculateNodeCount = (node: TaxonomyNode): Set<string> => {
      // 收集当前节点及所有子孙节点的文章 ID
      const allPostIds = new Set(node.postIds);

      // 递归处理所有子节点
      node.childNodes.forEach((child) => {
        const childPostIds = calculateNodeCount(child);
        // 合并子节点的文章 ID（Set 自动去重）
        childPostIds.forEach(id => allPostIds.add(id));
      });

      // 更新当前节点的 count
      node.count = allPostIds.size;

      // 返回收集到的所有文章 ID，供父节点使用
      return allPostIds;
    };

    // 从虚拟根节点开始递归计算
    calculateNodeCount(this.rootNode);
  }

  /**
   * 从文章列表初始化分类/标签树
   * @param posts - 所有文章列表
   * @param extractFn - 从文章提取路径的函数（如提取categories或tags）
   *
   * 设计要点：
   * 1. 使用 Set 存储 postIds 自动去重（同一文章可能被多次添加）
   * 2. 只在最深层路径存储文章ID（语义准确性）
   * 3. 父节点通过 childNodes 引用访问子节点数据
   */
  public initializeFromPosts(
    posts: Post[],
    extractFn: (post: Post) => string[],
  ): void {
    this.clear();

    // 构建path到posts的映射
    const pathMap = new Map<string, Post[]>();
    const uncategorizedPosts: Post[] = [];  // 无分类的文章

    posts.forEach((post) => {
      const paths = extractFn(post);
      if (paths.length === 0) {
        // 无分类的文章直接添加到根节点
        uncategorizedPosts.push(post);
        return;
      }

      paths.forEach((path) => {
        const normalized = this.normalizePath(path);
        if (normalized) {
          let postList = pathMap.get(normalized);
          if (!postList) {
            postList = [];
            pathMap.set(normalized, postList);
          }
          postList.push(post);
        }
      });
    });

    // 构建节点树
    pathMap.forEach((posts, path) => {
      this.buildFromPath(path, posts);
    });

    // 将无分类的文章添加到根节点
    uncategorizedPosts.forEach((post) => {
      this.rootNode.postIds.add(post.id);
    });

    // 所有节点构建完成后，统一计算递归 count
    this.calculateAllCounts();
  }
}
