-- Custom Firmware System Database Schema

-- 1. Core custom firmware table
CREATE TABLE custom_firmware (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  last_updated DATE,
  media_scraping BOOLEAN DEFAULT false,
  netplay BOOLEAN DEFAULT false,
  portmaster_support TEXT,
  wifi BOOLEAN DEFAULT false,
  external_wireless_usb BOOLEAN DEFAULT false,
  bluetooth BOOLEAN DEFAULT false,
  quick_game_switching BOOLEAN DEFAULT false,
  quick_resume BOOLEAN DEFAULT false,
  suspend_mode BOOLEAN DEFAULT false,
  rgb_settings BOOLEAN DEFAULT false,
  dpad_as_stick BOOLEAN DEFAULT false,
  power_management BOOLEAN DEFAULT false,
  file_browsing BOOLEAN DEFAULT false,
  integrated_media_players BOOLEAN DEFAULT false,
  random_game_selection BOOLEAN DEFAULT false,
  themes BOOLEAN DEFAULT false,
  retroachievements BOOLEAN DEFAULT false,
  ota_updates BOOLEAN DEFAULT false,
  hdmi_out BOOLEAN DEFAULT false,
  performance_modes BOOLEAN DEFAULT false,
  syncthing BOOLEAN DEFAULT false,
  native_pico8 BOOLEAN DEFAULT false,
  mtp_support BOOLEAN DEFAULT false,
  shaders BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. CFW Apps table
CREATE TABLE cfw_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  app_name TEXT NOT NULL,
  app_url TEXT,
  description TEXT,
  requirements TEXT,
  app_type TEXT,
  category TEXT,
  image_url TEXT,
  last_updated DATE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. Tools/Utilities table (separate from existing tools table)
CREATE TABLE tools_utilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  developer TEXT,
  price TEXT,
  image_url TEXT,
  categories TEXT,
  description TEXT,
  features TEXT,
  recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 4. Dynamic list tables for custom firmware
CREATE TABLE cfw_frontend_interfaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_firmware_id UUID REFERENCES custom_firmware(id) ON DELETE CASCADE,
  interface_name TEXT NOT NULL
);

CREATE TABLE cfw_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_firmware_id UUID REFERENCES custom_firmware(id) ON DELETE CASCADE,
  website_name TEXT NOT NULL,
  url TEXT NOT NULL
);

CREATE TABLE cfw_supported_consoles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_firmware_id UUID REFERENCES custom_firmware(id) ON DELETE CASCADE,
  console_name TEXT NOT NULL
);

CREATE TABLE cfw_compatible_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_firmware_id UUID REFERENCES custom_firmware(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL
);

CREATE TABLE cfw_performance_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_firmware_id UUID REFERENCES custom_firmware(id) ON DELETE CASCADE,
  mode_name TEXT NOT NULL
);

CREATE TABLE cfw_forks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_firmware_id UUID REFERENCES custom_firmware(id) ON DELETE CASCADE,
  forked_from_id UUID REFERENCES custom_firmware(id) ON DELETE CASCADE
);

CREATE TABLE cfw_community_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_firmware_id UUID REFERENCES custom_firmware(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  app_url TEXT
);

CREATE TABLE cfw_other_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_firmware_id UUID REFERENCES custom_firmware(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL
);

-- 5. Dynamic list tables for CFW apps
CREATE TABLE cfw_app_developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cfw_app_id UUID REFERENCES cfw_apps(id) ON DELETE CASCADE,
  developer_name TEXT NOT NULL
);

CREATE TABLE cfw_app_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cfw_app_id UUID REFERENCES cfw_apps(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL
);

CREATE TABLE cfw_app_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cfw_app_id UUID REFERENCES cfw_apps(id) ON DELETE CASCADE,
  link_name TEXT NOT NULL,
  url TEXT NOT NULL
);

-- 6. Dynamic list tables for tools/utilities
CREATE TABLE tool_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools_utilities(id) ON DELETE CASCADE,
  link_name TEXT NOT NULL,
  url TEXT NOT NULL
);

-- 7. Relational linking tables
CREATE TABLE cfw_app_handheld_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cfw_app_id UUID REFERENCES cfw_apps(id) ON DELETE CASCADE,
  handheld_id UUID REFERENCES handhelds(id) ON DELETE CASCADE
);

CREATE TABLE cfw_app_firmware_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cfw_app_id UUID REFERENCES cfw_apps(id) ON DELETE CASCADE,
  custom_firmware_id UUID REFERENCES custom_firmware(id) ON DELETE CASCADE
);

CREATE TABLE tool_device_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools_utilities(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL, -- 'handheld', 'os', 'custom_firmware'
  device_id UUID NOT NULL -- references handhelds.id, or custom_firmware.id depending on device_type
);

-- Create indexes for better performance
CREATE INDEX idx_custom_firmware_slug ON custom_firmware(slug);
CREATE INDEX idx_cfw_apps_slug ON cfw_apps(slug);
CREATE INDEX idx_tools_utilities_slug ON tools_utilities(slug);
CREATE INDEX idx_cfw_links_firmware_id ON cfw_links(custom_firmware_id);
CREATE INDEX idx_cfw_app_links_app_id ON cfw_app_links(cfw_app_id);
CREATE INDEX idx_tool_links_tool_id ON tool_links(tool_id);
