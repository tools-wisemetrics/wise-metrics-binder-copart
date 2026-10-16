import type { ConversionPath } from "@/lib/data/types";

export const conversionPaths: ConversionPath[] = [
  {
    id: "CP-001", userId: "USR-4821", conversionType: "habilitado", conversionDate: "2026-06-28",
    touchpoints: [
      { channel: "Meta Ads", source: "META_LEILAO_BR_LAL_VIDEO_CPC", timestamp: "2026-06-15", type: "visit" },
      { channel: "Site", source: "direct", timestamp: "2026-06-18", type: "visit" },
      { channel: "Google Ads", source: "GOOGLE_LEILAO_SP_INT_STATIC_CPM", timestamp: "2026-06-22", type: "visit" },
      { channel: "RD Station", source: "email_remarketing", timestamp: "2026-06-25", type: "interaction" },
      { channel: "RD Station", source: "email_habilitacao", timestamp: "2026-06-27", type: "interaction" },
      { channel: "Google Ads", source: "GOOGLE_LEILAO_SP_BRAND", timestamp: "2026-06-28", type: "visit" },
      { channel: "Habilitado", source: "platform", timestamp: "2026-06-28", type: "conversion" },
    ],
    totalTouchpoints: 7, daysToConversion: 13, firstChannel: "Meta Ads", lastChannel: "Google Ads",
  },
  {
    id: "CP-002", userId: "USR-5103", conversionType: "entrante", conversionDate: "2026-06-30",
    touchpoints: [
      { channel: "SEO", source: "google_organic", timestamp: "2026-06-25", type: "visit" },
      { channel: "Site", source: "direct", timestamp: "2026-06-27", type: "visit" },
      { channel: "Entrante", source: "registration", timestamp: "2026-06-30", type: "conversion" },
    ],
    totalTouchpoints: 3, daysToConversion: 5, firstChannel: "SEO", lastChannel: "Site",
  },
  {
    id: "CP-003", userId: "USR-3299", conversionType: "habilitado", conversionDate: "2026-07-01",
    touchpoints: [
      { channel: "Meta Ads", source: "META_LEILAO_BR_LAL_VIDEO_CPC", timestamp: "2026-06-10", type: "visit" },
      { channel: "Instagram Orgânico", source: "ig_stories", timestamp: "2026-06-14", type: "interaction" },
      { channel: "Site", source: "direct", timestamp: "2026-06-18", type: "visit" },
      { channel: "Google Ads", source: "GOOGLE_LEILAO_SP_INT_STATIC_CPM", timestamp: "2026-06-23", type: "visit" },
      { channel: "RD Station", source: "email_welcome", timestamp: "2026-06-24", type: "interaction" },
      { channel: "Habilitado", source: "platform", timestamp: "2026-07-01", type: "conversion" },
    ],
    totalTouchpoints: 6, daysToConversion: 21, firstChannel: "Meta Ads", lastChannel: "RD Station",
  },
  {
    id: "CP-004", userId: "USR-6740", conversionType: "entrante", conversionDate: "2026-06-29",
    touchpoints: [
      { channel: "TikTok", source: "tiktok_organic", timestamp: "2026-06-20", type: "visit" },
      { channel: "Instagram Orgânico", source: "ig_feed", timestamp: "2026-06-23", type: "interaction" },
      { channel: "Meta Ads", source: "META_LEILAO_BR_RET_STATIC", timestamp: "2026-06-26", type: "visit" },
      { channel: "Site", source: "direct", timestamp: "2026-06-28", type: "visit" },
      { channel: "Entrante", source: "registration", timestamp: "2026-06-29", type: "conversion" },
    ],
    totalTouchpoints: 5, daysToConversion: 9, firstChannel: "TikTok", lastChannel: "Site",
  },
  {
    id: "CP-005", userId: "USR-2187", conversionType: "licitante", conversionDate: "2026-07-02",
    touchpoints: [
      { channel: "Google Ads", source: "GOOGLE_LEILAO_SP_BRAND", timestamp: "2026-06-05", type: "visit" },
      { channel: "Site", source: "direct", timestamp: "2026-06-08", type: "visit" },
      { channel: "RD Station", source: "email_welcome", timestamp: "2026-06-10", type: "interaction" },
      { channel: "Meta Ads", source: "META_LEILAO_BR_RET_STATIC", timestamp: "2026-06-15", type: "visit" },
      { channel: "RD Station", source: "email_habilitacao", timestamp: "2026-06-20", type: "interaction" },
      { channel: "Site", source: "direct", timestamp: "2026-06-25", type: "visit" },
      { channel: "RD Station", source: "email_leilao", timestamp: "2026-07-01", type: "interaction" },
      { channel: "Licitante", source: "auction_bid", timestamp: "2026-07-02", type: "conversion" },
    ],
    totalTouchpoints: 8, daysToConversion: 27, firstChannel: "Google Ads", lastChannel: "RD Station",
  },
  {
    id: "CP-006", userId: "USR-8412", conversionType: "entrante", conversionDate: "2026-07-03",
    touchpoints: [
      { channel: "Facebook Orgânico", source: "fb_post", timestamp: "2026-06-28", type: "visit" },
      { channel: "Site", source: "direct", timestamp: "2026-07-01", type: "visit" },
      { channel: "SEO", source: "google_organic", timestamp: "2026-07-02", type: "visit" },
      { channel: "Entrante", source: "registration", timestamp: "2026-07-03", type: "conversion" },
    ],
    totalTouchpoints: 4, daysToConversion: 5, firstChannel: "Facebook Orgânico", lastChannel: "SEO",
  },
  {
    id: "CP-007", userId: "USR-1054", conversionType: "habilitado", conversionDate: "2026-06-30",
    touchpoints: [
      { channel: "Meta Ads", source: "META_LEILAO_BR_LAL_VIDEO_CPC", timestamp: "2026-06-12", type: "visit" },
      { channel: "RD Station", source: "email_welcome", timestamp: "2026-06-14", type: "interaction" },
      { channel: "Google Ads", source: "GOOGLE_LEILAO_SP_BRAND", timestamp: "2026-06-19", type: "visit" },
      { channel: "Site", source: "direct", timestamp: "2026-06-24", type: "visit" },
      { channel: "RD Station", source: "email_habilitacao", timestamp: "2026-06-28", type: "interaction" },
      { channel: "Habilitado", source: "platform", timestamp: "2026-06-30", type: "conversion" },
    ],
    totalTouchpoints: 6, daysToConversion: 18, firstChannel: "Meta Ads", lastChannel: "RD Station",
  },
  {
    id: "CP-008", userId: "USR-7263", conversionType: "conversa_whatsapp", conversionDate: "2026-07-01",
    touchpoints: [
      { channel: "Meta Ads", source: "META_SELECT_VENDER_BR_CPC", timestamp: "2026-06-25", type: "visit" },
      { channel: "Site", source: "direct", timestamp: "2026-06-28", type: "visit" },
      { channel: "Blip (WhatsApp)", source: "blip_chat", timestamp: "2026-07-01", type: "conversion" },
    ],
    totalTouchpoints: 3, daysToConversion: 6, firstChannel: "Meta Ads", lastChannel: "Site",
  },
  {
    id: "CP-009", userId: "USR-9501", conversionType: "entrante", conversionDate: "2026-07-04",
    touchpoints: [
      { channel: "TikTok", source: "tiktok_ad", timestamp: "2026-06-28", type: "visit" },
      { channel: "Instagram Orgânico", source: "ig_reels", timestamp: "2026-06-30", type: "interaction" },
      { channel: "Site", source: "direct", timestamp: "2026-07-02", type: "visit" },
      { channel: "SEO", source: "google_organic", timestamp: "2026-07-03", type: "visit" },
      { channel: "Entrante", source: "registration", timestamp: "2026-07-04", type: "conversion" },
    ],
    totalTouchpoints: 5, daysToConversion: 6, firstChannel: "TikTok", lastChannel: "SEO",
  },
  {
    id: "CP-010", userId: "USR-3847", conversionType: "habilitado", conversionDate: "2026-07-03",
    touchpoints: [
      { channel: "SEO", source: "google_organic", timestamp: "2026-06-15", type: "visit" },
      { channel: "Facebook Orgânico", source: "fb_group", timestamp: "2026-06-18", type: "interaction" },
      { channel: "Site", source: "direct", timestamp: "2026-06-22", type: "visit" },
      { channel: "RD Station", source: "email_remarketing", timestamp: "2026-06-25", type: "interaction" },
      { channel: "Google Ads", source: "GOOGLE_LEILAO_SP_BRAND", timestamp: "2026-06-28", type: "visit" },
      { channel: "RD Station", source: "email_habilitacao", timestamp: "2026-07-01", type: "interaction" },
      { channel: "Habilitado", source: "platform", timestamp: "2026-07-03", type: "conversion" },
    ],
    totalTouchpoints: 7, daysToConversion: 18, firstChannel: "SEO", lastChannel: "RD Station",
  },
  {
    id: "CP-011", userId: "USR-2910", conversionType: "entrante", conversionDate: "2026-06-27",
    touchpoints: [
      { channel: "Google Ads", source: "GOOGLE_LEILAO_SP_INT_STATIC_CPM", timestamp: "2026-06-24", type: "visit" },
      { channel: "Entrante", source: "registration", timestamp: "2026-06-27", type: "conversion" },
    ],
    totalTouchpoints: 2, daysToConversion: 3, firstChannel: "Google Ads", lastChannel: "Google Ads",
  },
  {
    id: "CP-012", userId: "USR-4560", conversionType: "arrematante", conversionDate: "2026-07-04",
    touchpoints: [
      { channel: "Meta Ads", source: "META_LEILAO_BR_LAL_VIDEO_CPC", timestamp: "2026-05-28", type: "visit" },
      { channel: "Site", source: "direct", timestamp: "2026-06-02", type: "visit" },
      { channel: "RD Station", source: "email_welcome", timestamp: "2026-06-04", type: "interaction" },
      { channel: "SEO", source: "google_organic", timestamp: "2026-06-10", type: "visit" },
      { channel: "Google Ads", source: "GOOGLE_LEILAO_SP_BRAND", timestamp: "2026-06-18", type: "visit" },
      { channel: "RD Station", source: "email_habilitacao", timestamp: "2026-06-22", type: "interaction" },
      { channel: "RD Station", source: "email_leilao", timestamp: "2026-06-30", type: "interaction" },
      { channel: "Arrematante", source: "auction_win", timestamp: "2026-07-04", type: "conversion" },
    ],
    totalTouchpoints: 8, daysToConversion: 37, firstChannel: "Meta Ads", lastChannel: "RD Station",
  },
  {
    id: "CP-013", userId: "USR-6100", conversionType: "veiculo_captado", conversionDate: "2026-07-02",
    touchpoints: [
      { channel: "Meta Ads", source: "META_SELECT_VENDER_BR_CPC", timestamp: "2026-06-20", type: "visit" },
      { channel: "Blip (WhatsApp)", source: "blip_chat", timestamp: "2026-06-22", type: "interaction" },
      { channel: "RD Station", source: "lead_qualificado", timestamp: "2026-06-28", type: "interaction" },
      { channel: "Veículos Captados", source: "select_venda", timestamp: "2026-07-02", type: "conversion" },
    ],
    totalTouchpoints: 4, daysToConversion: 12, firstChannel: "Meta Ads", lastChannel: "Blip (WhatsApp)",
  },
  {
    id: "CP-014", userId: "USR-8834", conversionType: "veiculo_vendido", conversionDate: "2026-07-01",
    touchpoints: [
      { channel: "Google Ads", source: "GOOGLE_SELECT_COMPRAR_PMAX", timestamp: "2026-06-18", type: "visit" },
      { channel: "Site", source: "direct", timestamp: "2026-06-20", type: "visit" },
      { channel: "Blip (WhatsApp)", source: "blip_proposta", timestamp: "2026-06-25", type: "interaction" },
      { channel: "Veículos Vendidos", source: "select_compra", timestamp: "2026-07-01", type: "conversion" },
    ],
    totalTouchpoints: 4, daysToConversion: 13, firstChannel: "Google Ads", lastChannel: "Blip (WhatsApp)",
  },
  {
    id: "CP-015", userId: "USR-1298", conversionType: "habilitado", conversionDate: "2026-06-30",
    touchpoints: [
      { channel: "SEO", source: "google_organic", timestamp: "2026-06-26", type: "visit" },
      { channel: "Meta Ads", source: "META_LEILAO_BR_RET_STATIC", timestamp: "2026-06-28", type: "visit" },
      { channel: "Habilitado", source: "platform", timestamp: "2026-06-30", type: "conversion" },
    ],
    totalTouchpoints: 3, daysToConversion: 4, firstChannel: "SEO", lastChannel: "Meta Ads",
  },
];
