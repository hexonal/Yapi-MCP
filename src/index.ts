import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { YapiMcpServer } from "./server";
import { getServerConfig } from "./config";
import { Logger } from "./services/yapi/logger";

// 导出 YApi 服务相关类型和工具
export * from "./services/yapi/types";
export * from "./services/yapi/api";
export * from "./services/yapi/cache";
export * from "./services/yapi/logger";

export async function startServer(): Promise<void> {
  const config = getServerConfig();
  
  // 创建日志实例
  const logger = new Logger("StartServer", config.yapiLogLevel);
  
  // 创建 YapiMcpServer 实例，使用配置中的所有参数
  const server = new YapiMcpServer(
    config.yapiBaseUrl, 
    config.yapiToken, 
    config.yapiLogLevel, 
    config.yapiCacheTTL
  );

  // Check if we're running in stdio mode (e.g., via CLI)
  const isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");

  if (isStdioMode) {
    logger.info("Initializing Yapi MCP Server in stdio mode...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } else {
    logger.info(`Initializing Yapi MCP Server in HTTP mode on port ${config.port}...`);
    await server.startHttpServer(config.port);
  }

  logger.info("\n可用工具:");
  logger.info("- yapi_get_api_desc: 获取YApi接口信息");
  logger.info("- yapi_save_api: 新增或更新YApi接口");
  logger.info("- yapi_search_apis: 搜索YApi接口");
  logger.info("- yapi_list_projects: 列出YApi的项目ID和项目名称");
  logger.info("- yapi_get_categories: 获取YApi项目下的接口分类列表");
  logger.info("- yapi_save_category: 创建新的接口分类");
}

// If this file is being run directly, start the server
if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
