
-- CreateTable
CREATE TABLE "SupportContactInfo" (
    "id" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL DEFAULT '+57 300 KHESED (543733)',
    "whatsappUrl" TEXT NOT NULL DEFAULT 'https://wa.me/573003435733',
    "email" TEXT NOT NULL DEFAULT 'soporte@khesedtek.com',
    "schedule" TEXT NOT NULL DEFAULT 'Lun-Vie 8AM-8PM (Colombia)',
    "companyName" TEXT NOT NULL DEFAULT 'Khesed-tek Systems',
    "location" TEXT NOT NULL DEFAULT 'Bogotá, Colombia',
    "website" TEXT NOT NULL DEFAULT 'https://khesedtek.com',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportContactInfo_pkey" PRIMARY KEY ("id")
);

-- Insert default values
INSERT INTO "SupportContactInfo" (
    "id",
    "whatsappNumber",
    "whatsappUrl", 
    "email",
    "schedule",
    "companyName",
    "location",
    "website"
) VALUES (
    'default',
    '+57 300 KHESED (543733)',
    'https://wa.me/573003435733',
    'soporte@khesedtek.com',
    'Lun-Vie 8AM-8PM (Colombia)',
    'Khesed-tek Systems',
    'Bogotá, Colombia',
    'https://khesedtek.com'
);
