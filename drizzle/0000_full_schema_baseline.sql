
CREATE TABLE IF NOT EXISTS `accountTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`purpose` enum('account_invitation','password_reset') NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `accountTokens_tokenHash_unique` UNIQUE(`tokenHash`)
);

CREATE TABLE IF NOT EXISTS `accountingEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`kind` enum('inventory_purchase','shipping','platform','advertising','payment_fee','other_expense','refund') NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`occurredAt` timestamp NOT NULL,
	`supplier` varchar(160),
	`receiptUrl` varchar(500),
	`receiptKey` varchar(500),
	`receiptFileName` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accountingEntries_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`actorUserId` int,
	`actorName` varchar(200),
	`actorRole` varchar(40),
	`action` varchar(80) NOT NULL,
	`entityType` varchar(40) NOT NULL,
	`entityId` int,
	`summary` varchar(500) NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `banners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`subtitle` text,
	`imageUrl` varchar(500) NOT NULL,
	`linkUrl` varchar(500),
	`active` int NOT NULL DEFAULT 1,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `banners_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`message` varchar(300),
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`imageDesktopUrl` varchar(1000),
	`imageMobileUrl` varchar(1000),
	`linkUrl` varchar(1000),
	`promoCode` varchar(64),
	`showCountdown` int NOT NULL DEFAULT 1,
	`placement` enum('announcement','products','both') NOT NULL DEFAULT 'announcement',
	`enabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `cartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`cartId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cartItems_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `carts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`userId` int NOT NULL,
	`reminderSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carts_id` PRIMARY KEY(`id`),
	CONSTRAINT `carts_store_user_unique` UNIQUE(`storeId`,`userId`)
);

CREATE TABLE IF NOT EXISTS `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`publicNotice` text,
	`emptyStateMessage` text,
	`imageUrl` varchar(500),
	`icon` varchar(20),
	`displayOrder` int NOT NULL DEFAULT 0,
	`catalogSection` enum('standard','creations') NOT NULL DEFAULT 'standard',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_store_slug_unique` UNIQUE(`storeId`,`slug`)
);

CREATE TABLE IF NOT EXISTS `contactMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`subject` varchar(200),
	`message` text NOT NULL,
	`status` enum('unread','read','archived') NOT NULL DEFAULT 'unread',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contactMessages_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `customCreationRequestEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`requestId` int NOT NULL,
	`action` varchar(40) NOT NULL,
	`fromStatus` varchar(30),
	`toStatus` varchar(30) NOT NULL,
	`note` varchar(500),
	`actorUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customCreationRequestEvents_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `customCreationRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('portrait','object','animal','home','textile','other') NOT NULL,
	`title` varchar(140) NOT NULL,
	`description` text NOT NULL,
	`dimensions` varchar(300),
	`budget` varchar(120),
	`deadline` varchar(120),
	`status` enum('submitted','in_review','answered','closed') NOT NULL DEFAULT 'submitted',
	`ownerReply` text,
	`ownerActorUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customCreationRequests_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `lemonSqueezyBillingCheckouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`checkoutNonce` varchar(160) NOT NULL,
	`planId` varchar(40) NOT NULL,
	`mode` enum('test') NOT NULL DEFAULT 'test',
	`status` enum('created','paid','void') NOT NULL DEFAULT 'created',
	`lemonCheckoutId` varchar(120),
	`lemonOrderId` varchar(120),
	`paidAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lemonSqueezyBillingCheckouts_id` PRIMARY KEY(`id`),
	CONSTRAINT `lemon_squeezy_billing_checkout_nonce_unique` UNIQUE(`checkoutNonce`),
	CONSTRAINT `lemon_squeezy_billing_checkout_order_unique` UNIQUE(`lemonOrderId`)
);

CREATE TABLE IF NOT EXISTS `lemonSqueezySubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`lemonSubscriptionId` varchar(120) NOT NULL,
	`lemonOrderId` varchar(120),
	`planId` varchar(40) NOT NULL,
	`mode` enum('test') NOT NULL DEFAULT 'test',
	`status` enum('on_trial','active','paused','past_due','unpaid','cancelled','expired') NOT NULL,
	`renewsAt` timestamp,
	`endsAt` timestamp,
	`lastEventAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lemonSqueezySubscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `lemon_squeezy_subscription_store_unique` UNIQUE(`storeId`),
	CONSTRAINT `lemon_squeezy_subscription_id_unique` UNIQUE(`lemonSubscriptionId`)
);

CREATE TABLE IF NOT EXISTS `lemonSqueezyWebhookEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bodyHash` varchar(64) NOT NULL,
	`eventName` varchar(80) NOT NULL,
	`resourceType` varchar(40),
	`resourceId` varchar(120),
	`storeId` int,
	`status` enum('processing','processed','failed') NOT NULL DEFAULT 'processing',
	`processedAt` timestamp,
	`failureCode` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lemonSqueezyWebhookEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `lemon_squeezy_webhook_body_hash_unique` UNIQUE(`bodyHash`)
);

CREATE TABLE IF NOT EXISTS `orderDecisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`orderId` int NOT NULL,
	`action` enum('accepted','rejected','refund_requested') NOT NULL,
	`reason` varchar(500),
	`actorUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderDecisions_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `orderFulfillmentJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`orderId` int NOT NULL,
	`provider` varchar(40) NOT NULL,
	`jobType` enum('prepare_cj_sandbox','prepare_cj_live','process_cj_event') NOT NULL,
	`state` enum('queued','running','completed','failed','cancelled') NOT NULL DEFAULT 'queued',
	`idempotencyKey` varchar(255) NOT NULL,
	`attempts` int NOT NULL DEFAULT 0,
	`lastError` varchar(1000),
	`availableAt` timestamp NOT NULL DEFAULT (now()),
	`lockedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orderFulfillmentJobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `orderFulfillmentJobs_idempotencyKey_unique` UNIQUE(`idempotencyKey`)
);

CREATE TABLE IF NOT EXISTS `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`priceAtPurchase` int NOT NULL,
	`priceAtPurchaseChf` int NOT NULL DEFAULT 0,
	`productNameSnapshot` varchar(255),
	`selectedOptions` text,
	`supplierSnapshot` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `orderSupplierOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`orderId` int NOT NULL,
	`provider` varchar(40) NOT NULL,
	`mode` enum('sandbox','live') NOT NULL,
	`externalReference` varchar(128) NOT NULL,
	`providerOrderId` varchar(200),
	`providerOrderNumber` varchar(200),
	`providerShipmentOrderId` varchar(200),
	`state` enum('draft','payment_review','payment_pending','paid','exception','shipped','delivered','cancelled') NOT NULL DEFAULT 'draft',
	`paymentMode` enum('none','page','balance') NOT NULL DEFAULT 'none',
	`paymentUrl` varchar(1000),
	`supplierCurrency` varchar(3) NOT NULL DEFAULT 'USD',
	`supplierProductAmount` int,
	`supplierShippingAmount` int,
	`supplierTaxAmount` int,
	`supplierTotalAmount` int,
	`exchangeRateChf` decimal(10,6),
	`customerSaleAmount` int NOT NULL,
	`quoteSnapshot` text,
	`orderSnapshot` text,
	`approvalActorUserId` int,
	`approvedAt` timestamp,
	`paidAt` timestamp,
	`trackingNumber` varchar(200),
	`trackingProvider` varchar(200),
	`trackingUrl` varchar(1000),
	`trackingStatus` varchar(80),
	`lastError` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orderSupplierOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orderSupplierOrders_externalReference_unique` UNIQUE(`externalReference`)
);

CREATE TABLE IF NOT EXISTS `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`totalAmount` int NOT NULL,
	`totalAmountChf` int NOT NULL DEFAULT 0,
	`currencyCode` varchar(3) NOT NULL DEFAULT 'CHF',
	`currencyRateBps` int NOT NULL DEFAULT 10000,
	`customerShippingAmount` int NOT NULL DEFAULT 0,
	`customerShippingAmountChf` int NOT NULL DEFAULT 0,
	`shippingAddress` text NOT NULL,
	`billingAddress` text,
	`paymentStatus` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
	`paymentMethod` varchar(50),
	`cashOnDeliveryRequestId` varchar(64),
	`stripeSessionId` varchar(255),
	`stripeConnectedAccountId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`stripeApplicationFeeAmount` int NOT NULL DEFAULT 0,
	`stripeCommissionRateBps` int NOT NULL DEFAULT 0,
	`trackingNumber` varchar(100),
	`trackingCarrier` varchar(120),
	`trackingUrl` varchar(1000),
	`fulfillmentState` enum('not_eligible','awaiting_supplier_preparation','supplier_order_draft','supplier_payment_review','supplier_payment_pending','supplier_paid','supplier_exception','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'not_eligible',
	`odooSaleOrderId` int,
	`fulfillmentLastError` varchar(1000),
	`fulfillmentUpdatedAt` timestamp,
	`promotionId` int,
	`discountAmount` int NOT NULL DEFAULT 0,
	`discountAmountChf` int NOT NULL DEFAULT 0,
	`legalAcceptanceVersion` varchar(64),
	`legalAcceptedAt` timestamp,
	`legalAcceptanceSnapshot` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `ownerAiConversationMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`contentCiphertext` mediumtext NOT NULL,
	`contentIv` varchar(48) NOT NULL,
	`characterCount` int NOT NULL,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ownerAiConversationMessages_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `ownerAiConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`titleCiphertext` text NOT NULL,
	`titleIv` varchar(48) NOT NULL,
	`createdByUserId` int NOT NULL,
	`messageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ownerAiConversations_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `ownerAiWorkspaceDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`kind` enum('document','template') NOT NULL DEFAULT 'document',
	`visibility` enum('private','team') NOT NULL DEFAULT 'private',
	`titleCiphertext` text NOT NULL,
	`titleIv` varchar(48) NOT NULL,
	`contentCiphertext` mediumtext NOT NULL,
	`contentIv` varchar(48) NOT NULL,
	`createdByUserId` int NOT NULL,
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ownerAiWorkspaceDocuments_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `ownerKnowledgeDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`folder` varchar(100) NOT NULL DEFAULT 'Général',
	`title` varchar(180) NOT NULL,
	`sourceName` varchar(255) NOT NULL,
	`sourceType` enum('pdf','docx','txt','csv') NOT NULL,
	`contentCiphertext` mediumtext NOT NULL,
	`contentIv` varchar(48) NOT NULL,
	`contentHash` varchar(64) NOT NULL,
	`characterCount` int NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ownerKnowledgeDocuments_id` PRIMARY KEY(`id`),
	CONSTRAINT `owner_knowledge_documents_store_hash_unique` UNIQUE(`storeId`,`contentHash`)
);

CREATE TABLE IF NOT EXISTS `ownerProductVariants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`productId` int NOT NULL,
	`label` varchar(160) NOT NULL,
	`sku` varchar(100),
	`imageUrl` varchar(500),
	`priceAdjustmentCents` int NOT NULL DEFAULT 0,
	`stock` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ownerProductVariants_id` PRIMARY KEY(`id`),
	CONSTRAINT `owner_product_variants_store_product_label_unique` UNIQUE(`storeId`,`productId`,`label`)
);

CREATE TABLE IF NOT EXISTS `productCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`productId` int NOT NULL,
	`categoryId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_categories_store_product_category_unique` UNIQUE(`storeId`,`productId`,`categoryId`)
);

CREATE TABLE IF NOT EXISTS `productDeliveryProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`productId` int NOT NULL,
	`countryCode` varchar(2) NOT NULL,
	`supplierVariantId` varchar(128),
	`supplierShippingCost` int NOT NULL,
	`customerShippingCost` int NOT NULL,
	`deliveryMethod` varchar(255),
	`minDeliveryDays` int,
	`maxDeliveryDays` int,
	`quotedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productDeliveryProfiles_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `productImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`productId` int NOT NULL,
	`imageUrl` varchar(500) NOT NULL,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productImages_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `productTranslations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`productId` int NOT NULL,
	`locale` varchar(10) NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`longDescription` text,
	`options` text,
	`status` enum('ready','stale') NOT NULL DEFAULT 'ready',
	`machineGenerated` int NOT NULL DEFAULT 1,
	`sourceUpdatedAt` timestamp NOT NULL DEFAULT (now()),
	`translatedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productTranslations_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_translations_store_product_locale_unique` UNIQUE(`storeId`,`productId`,`locale`)
);

CREATE TABLE IF NOT EXISTS `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`longDescription` text,
	`price` int NOT NULL,
	`originalPrice` int,
	`stock` int NOT NULL DEFAULT 0,
	`featured` int NOT NULL DEFAULT 0,
	`showNewBadge` int NOT NULL DEFAULT 0,
	`status` enum('active','draft','archived') NOT NULL DEFAULT 'active',
	`supplier` varchar(32),
	`supplierProductId` varchar(128),
	`supplierUrl` varchar(1000),
	`supplierPrice` int,
	`supplierWeightG` int,
	`supplierVariantMappings` text,
	`options` text,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_store_slug_unique` UNIQUE(`storeId`,`slug`)
);

CREATE TABLE IF NOT EXISTS `promotionRedemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`promotionId` int NOT NULL,
	`userId` int NOT NULL,
	`orderId` int,
	`discountAmount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promotionRedemptions_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`code` varchar(64) NOT NULL,
	`type` enum('percent','fixed') NOT NULL DEFAULT 'percent',
	`value` int NOT NULL,
	`minOrderAmount` int,
	`maxUses` int,
	`usedCount` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`scope` enum('all','first_order','category','products') NOT NULL DEFAULT 'all',
	`categoryId` int,
	`productIds` text,
	`perUserLimit` int,
	`startsAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotions_store_code_unique` UNIQUE(`storeId`,`code`)
);

CREATE TABLE IF NOT EXISTS `publicContentTranslations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`contentType` enum('design','banner','category') NOT NULL,
	`contentId` int NOT NULL,
	`locale` varchar(10) NOT NULL,
	`payload` text NOT NULL,
	`status` enum('ready','stale') NOT NULL DEFAULT 'ready',
	`machineGenerated` int NOT NULL DEFAULT 1,
	`sourceUpdatedAt` timestamp NOT NULL DEFAULT (now()),
	`translatedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publicContentTranslations_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `returnRequestEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`returnRequestId` int NOT NULL,
	`action` varchar(40) NOT NULL,
	`fromStatus` varchar(40),
	`toStatus` varchar(40) NOT NULL,
	`note` varchar(1000),
	`actorUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `returnRequestEvents_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `returnRequestItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`returnRequestId` int NOT NULL,
	`orderItemId` int NOT NULL,
	`productId` int NOT NULL,
	`productNameSnapshot` varchar(255) NOT NULL,
	`selectedOptionsSnapshot` text,
	`quantity` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `returnRequestItems_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `returnRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`orderId` int NOT NULL,
	`userId` int NOT NULL,
	`reason` varchar(1000) NOT NULL,
	`status` enum('requested','approved','return_received','closed','rejected','refunded') NOT NULL DEFAULT 'requested',
	`instructions` varchar(1000),
	`resolutionNote` varchar(1000),
	`refundAmount` int,
	`externalCaseType` enum('none','refund','dispute','other') NOT NULL DEFAULT 'none',
	`externalCaseStatus` enum('not_started','action_required','submitted','resolved') NOT NULL DEFAULT 'not_started',
	`externalCaseProvider` enum('not_specified','stripe','chargily','carrier','other') NOT NULL DEFAULT 'not_specified',
	`externalCaseReference` varchar(120),
	`externalCaseDeadlineAt` timestamp,
	`externalCaseNote` varchar(1000),
	`actorUserId` int,
	`returnReceivedAt` timestamp,
	`closedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `returnRequests_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`productId` int NOT NULL,
	`userId` int,
	`authorName` varchar(120),
	`rating` int NOT NULL,
	`comment` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);

CREATE TABLE IF NOT EXISTS `storeAiMonthlyUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`periodKey` varchar(7) NOT NULL,
	`requestCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeAiMonthlyUsage_id` PRIMARY KEY(`id`),
	CONSTRAINT `store_ai_monthly_usage_store_period_unique` UNIQUE(`storeId`,`periodKey`)
);

CREATE TABLE IF NOT EXISTS `storeMemberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','manager','catalog_editor','support_agent','order_operator','accountant','viewer') NOT NULL DEFAULT 'viewer',
	`status` enum('active','blocked') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeMemberships_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `storeProvisioningDrafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`requestedDomain` varchar(255) NOT NULL,
	`ownerName` varchar(160) NOT NULL,
	`ownerEmail` varchar(320) NOT NULL,
	`businessType` enum('animalier','bijoux','vetements','autre') NOT NULL DEFAULT 'autre',
	`customBusinessTheme` varchar(160),
	`themePreset` varchar(32),
	`factoryModel` varchar(32) NOT NULL DEFAULT 'blank',
	`provisioningTemplate` varchar(32) NOT NULL DEFAULT 'standard',
	`launchMarket` varchar(32) NOT NULL DEFAULT 'custom',
	`paymentRoute` varchar(32) NOT NULL DEFAULT 'stripe_connect',
	`preferredCurrency` varchar(3) NOT NULL DEFAULT 'CHF',
	`requestedPlan` varchar(16),
	`copySourceStoreId` int,
	`copySelection` text,
	`status` enum('draft','ready_for_confirmation','archived') NOT NULL DEFAULT 'draft',
	`notes` text,
	`provisionedStoreId` int,
	`provisionedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeProvisioningDrafts_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `storeSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeSettings_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`primaryDomain` varchar(255) NOT NULL,
	`status` enum('setup','active','limited','suspended','closed') NOT NULL DEFAULT 'setup',
	`isPlatformStore` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`),
	CONSTRAINT `stores_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `stores_primaryDomain_unique` UNIQUE(`primaryDomain`)
);

CREATE TABLE IF NOT EXISTS `stripeConnectedAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`stripeAccountId` varchar(255) NOT NULL,
	`mode` enum('test') NOT NULL DEFAULT 'test',
	`accountType` enum('express') NOT NULL DEFAULT 'express',
	`status` enum('created','onboarding','active','restricted') NOT NULL DEFAULT 'created',
	`onboardingComplete` int NOT NULL DEFAULT 0,
	`chargesEnabled` int NOT NULL DEFAULT 0,
	`payoutsEnabled` int NOT NULL DEFAULT 0,
	`detailsSubmitted` int NOT NULL DEFAULT 0,
	`lastCheckedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripeConnectedAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_connected_accounts_store_unique` UNIQUE(`storeId`),
	CONSTRAINT `stripe_connected_accounts_account_unique` UNIQUE(`stripeAccountId`)
);

CREATE TABLE IF NOT EXISTS `stripeLiveConnectedAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`stripeAccountId` varchar(255) NOT NULL,
	`mode` enum('live') NOT NULL DEFAULT 'live',
	`accountType` enum('express') NOT NULL DEFAULT 'express',
	`status` enum('created','onboarding','active','restricted') NOT NULL DEFAULT 'created',
	`onboardingComplete` int NOT NULL DEFAULT 0,
	`chargesEnabled` int NOT NULL DEFAULT 0,
	`payoutsEnabled` int NOT NULL DEFAULT 0,
	`detailsSubmitted` int NOT NULL DEFAULT 0,
	`lastCheckedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripeLiveConnectedAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_live_connected_accounts_store_unique` UNIQUE(`storeId`),
	CONSTRAINT `stripe_live_connected_accounts_account_unique` UNIQUE(`stripeAccountId`)
);

CREATE TABLE IF NOT EXISTS `studioImageGenerationUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`periodKey` varchar(10) NOT NULL,
	`requestCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studioImageGenerationUsage_id` PRIMARY KEY(`id`),
	CONSTRAINT `studio_image_generation_usage_user_period_unique` UNIQUE(`userId`,`periodKey`)
);

CREATE TABLE IF NOT EXISTS `supplierWebhookEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int,
	`provider` varchar(40) NOT NULL,
	`messageId` varchar(200) NOT NULL,
	`eventType` varchar(40) NOT NULL,
	`messageType` varchar(40) NOT NULL,
	`providerOrderId` varchar(200),
	`externalReference` varchar(200),
	`payload` text,
	`processingState` enum('received','processed','ignored','failed') NOT NULL DEFAULT 'received',
	`processingError` varchar(1000),
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `supplierWebhookEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `supplierWebhookEvents_messageId_unique` UNIQUE(`messageId`)
);

CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`passwordHash` varchar(255),
	`loginMethod` varchar(64),
	`role` enum('user','catalog_editor','support_agent','order_operator','admin') NOT NULL DEFAULT 'user',
	`accountStatus` enum('pending_invitation','active','blocked') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

CREATE INDEX `accounting_entries_store_occurred_idx` ON `accountingEntries` (`storeId`,`occurredAt`);
CREATE INDEX `campaigns_store_starts_at_idx` ON `campaigns` (`storeId`,`startsAt`);
CREATE INDEX `campaigns_store_enabled_window_idx` ON `campaigns` (`storeId`,`enabled`,`startsAt`,`endsAt`);
CREATE INDEX `cart_items_store_cart_product_idx` ON `cartItems` (`storeId`,`cartId`,`productId`);
CREATE INDEX `categories_store_order_idx` ON `categories` (`storeId`,`displayOrder`);
CREATE INDEX `contact_messages_store_status_created_idx` ON `contactMessages` (`storeId`,`status`,`createdAt`);
CREATE INDEX `custom_creation_request_events_store_request_created_idx` ON `customCreationRequestEvents` (`storeId`,`requestId`,`createdAt`);
CREATE INDEX `custom_creation_requests_store_status_updated_idx` ON `customCreationRequests` (`storeId`,`status`,`updatedAt`);
CREATE INDEX `custom_creation_requests_store_user_updated_idx` ON `customCreationRequests` (`storeId`,`userId`,`updatedAt`);
CREATE INDEX `lemon_squeezy_billing_checkout_store_status_created_idx` ON `lemonSqueezyBillingCheckouts` (`storeId`,`status`,`createdAt`);
CREATE INDEX `lemon_squeezy_subscription_status_idx` ON `lemonSqueezySubscriptions` (`status`,`updatedAt`);
CREATE INDEX `lemon_squeezy_webhook_store_created_idx` ON `lemonSqueezyWebhookEvents` (`storeId`,`createdAt`);
CREATE INDEX `order_decisions_store_order_idx` ON `orderDecisions` (`storeId`,`orderId`);
CREATE INDEX `order_fulfillment_jobs_store_order_idx` ON `orderFulfillmentJobs` (`storeId`,`orderId`);
CREATE INDEX `order_fulfillment_jobs_store_state_available_idx` ON `orderFulfillmentJobs` (`storeId`,`state`,`availableAt`);
CREATE INDEX `order_items_store_order_idx` ON `orderItems` (`storeId`,`orderId`);
CREATE INDEX `order_supplier_orders_store_order_idx` ON `orderSupplierOrders` (`storeId`,`orderId`);
CREATE INDEX `order_supplier_orders_store_provider_order_idx` ON `orderSupplierOrders` (`storeId`,`provider`,`providerOrderId`);
CREATE INDEX `orders_store_user_created_idx` ON `orders` (`storeId`,`userId`,`createdAt`);
CREATE INDEX `orders_store_status_created_idx` ON `orders` (`storeId`,`status`,`createdAt`);
CREATE INDEX `owner_ai_conversation_messages_conversation_idx` ON `ownerAiConversationMessages` (`conversationId`,`id`);
CREATE INDEX `owner_ai_conversation_messages_store_idx` ON `ownerAiConversationMessages` (`storeId`,`createdAt`);
CREATE INDEX `owner_ai_conversations_store_updated_idx` ON `ownerAiConversations` (`storeId`,`updatedAt`);
CREATE INDEX `owner_ai_workspace_documents_store_kind_updated_idx` ON `ownerAiWorkspaceDocuments` (`storeId`,`kind`,`updatedAt`);
CREATE INDEX `owner_knowledge_documents_store_updated_idx` ON `ownerKnowledgeDocuments` (`storeId`,`updatedAt`);
CREATE INDEX `owner_knowledge_documents_store_folder_idx` ON `ownerKnowledgeDocuments` (`storeId`,`folder`);
CREATE INDEX `owner_product_variants_store_product_order_idx` ON `ownerProductVariants` (`storeId`,`productId`,`displayOrder`);
CREATE INDEX `product_categories_store_product_idx` ON `productCategories` (`storeId`,`productId`);
CREATE INDEX `delivery_profiles_store_product_country_idx` ON `productDeliveryProfiles` (`storeId`,`productId`,`countryCode`);
CREATE INDEX `product_images_store_product_order_idx` ON `productImages` (`storeId`,`productId`,`displayOrder`);
CREATE INDEX `product_translations_store_product_idx` ON `productTranslations` (`storeId`,`productId`);
CREATE INDEX `products_store_category_idx` ON `products` (`storeId`,`categoryId`);
CREATE INDEX `products_store_supplier_idx` ON `products` (`storeId`,`supplier`,`supplierProductId`);
CREATE INDEX `promotion_redemptions_store_promotion_user_idx` ON `promotionRedemptions` (`storeId`,`promotionId`,`userId`);
CREATE INDEX `promotions_store_active_idx` ON `promotions` (`storeId`,`active`);
CREATE INDEX `return_request_events_store_request_created_idx` ON `returnRequestEvents` (`storeId`,`returnRequestId`,`createdAt`);
CREATE INDEX `return_request_items_store_request_idx` ON `returnRequestItems` (`storeId`,`returnRequestId`);
CREATE INDEX `return_request_items_store_order_item_idx` ON `returnRequestItems` (`storeId`,`orderItemId`);
CREATE INDEX `return_requests_store_order_idx` ON `returnRequests` (`storeId`,`orderId`);
CREATE INDEX `return_requests_store_user_status_idx` ON `returnRequests` (`storeId`,`userId`,`status`);
CREATE INDEX `return_requests_store_case_status_idx` ON `returnRequests` (`storeId`,`externalCaseStatus`,`updatedAt`);
CREATE INDEX `reviews_store_product_status_idx` ON `reviews` (`storeId`,`productId`,`status`);
CREATE INDEX `store_ai_monthly_usage_store_period_idx` ON `storeAiMonthlyUsage` (`storeId`,`periodKey`);
CREATE INDEX `studio_image_generation_usage_user_period_idx` ON `studioImageGenerationUsage` (`userId`,`periodKey`);
CREATE INDEX `supplier_webhook_events_store_provider_state_idx` ON `supplierWebhookEvents` (`storeId`,`provider`,`processingState`);
