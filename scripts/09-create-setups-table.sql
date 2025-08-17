-- Create setups table for showcasing emulation setups
CREATE TABLE IF NOT EXISTS public.setups (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    difficulty VARCHAR(50) DEFAULT 'Beginner',
    estimated_time VARCHAR(100),
    image_url TEXT,
    guide_content TEXT,
    requirements TEXT[],
    steps JSONB,
    tags TEXT[],
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create setup_components table for linking setups to various components
CREATE TABLE IF NOT EXISTS public.setup_components (
    id SERIAL PRIMARY KEY,
    setup_id INTEGER REFERENCES public.setups(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL, -- 'handheld', 'emulator', 'game', 'tool', 'cfw_app', 'custom_firmware'
    component_id INTEGER NOT NULL,
    component_name VARCHAR(255),
    component_description TEXT,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_components ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to setups" ON public.setups
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to setup_components" ON public.setup_components
    FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_setups_slug ON public.setups(slug);
CREATE INDEX IF NOT EXISTS idx_setups_featured ON public.setups(featured);
CREATE INDEX IF NOT EXISTS idx_setups_difficulty ON public.setups(difficulty);
CREATE INDEX IF NOT EXISTS idx_setup_components_setup_id ON public.setup_components(setup_id);
CREATE INDEX IF NOT EXISTS idx_setup_components_type ON public.setup_components(component_type);

-- Insert sample setup data
INSERT INTO public.setups (title, slug, description, difficulty, estimated_time, image_url, guide_content, requirements, steps, tags, featured) VALUES
('Steam Deck Retro Gaming Setup', 'steam-deck-retro-setup', 'Complete guide to setting up retro gaming on Steam Deck with EmuDeck', 'Beginner', '30-45 minutes', '/placeholder.svg?height=400&width=600', 'This comprehensive guide will walk you through setting up the ultimate retro gaming experience on your Steam Deck using EmuDeck.', 
 ARRAY['Steam Deck', 'MicroSD Card (64GB+)', 'Internet Connection'], 
 '[{"step": 1, "title": "Download EmuDeck", "description": "Visit the EmuDeck website and download the installer"}, {"step": 2, "title": "Install EmuDeck", "description": "Run the installer and follow the setup wizard"}, {"step": 3, "title": "Configure Emulators", "description": "Set up your preferred emulators and BIOS files"}, {"step": 4, "title": "Add ROMs", "description": "Copy your ROM files to the appropriate directories"}]'::jsonb,
 ARRAY['steam-deck', 'emudeck', 'retro-gaming', 'beginner'], true),

('ROG Ally Windows Emulation', 'rog-ally-windows-emulation', 'Setting up emulation on ROG Ally with Windows and Playnite', 'Intermediate', '1-2 hours', '/placeholder.svg?height=400&width=600', 'Learn how to create the perfect emulation setup on ROG Ally using Windows and Playnite as your frontend.',
 ARRAY['ROG Ally', 'External Storage', 'Playnite'], 
 '[{"step": 1, "title": "Install Playnite", "description": "Download and install Playnite as your game launcher"}, {"step": 2, "title": "Setup Emulators", "description": "Install RetroArch and standalone emulators"}, {"step": 3, "title": "Configure Controllers", "description": "Set up controller mappings for different systems"}, {"step": 4, "title": "Import Games", "description": "Add your ROM collection to Playnite"}]'::jsonb,
 ARRAY['rog-ally', 'windows', 'playnite', 'intermediate'], true),

('Anbernic RG35XX Custom Firmware', 'anbernic-rg35xx-cfw', 'Installing and configuring custom firmware on Anbernic RG35XX', 'Advanced', '45-60 minutes', '/placeholder.svg?height=400&width=600', 'Unlock the full potential of your Anbernic RG35XX with custom firmware installation and optimization.',
 ARRAY['Anbernic RG35XX', 'MicroSD Card', 'Card Reader', 'Computer'], 
 '[{"step": 1, "title": "Backup Original Firmware", "description": "Create a backup of your original firmware"}, {"step": 2, "title": "Download Custom Firmware", "description": "Get the latest custom firmware release"}, {"step": 3, "title": "Flash Firmware", "description": "Flash the custom firmware to your device"}, {"step": 4, "title": "Configure Settings", "description": "Optimize settings for best performance"}]'::jsonb,
 ARRAY['anbernic', 'custom-firmware', 'rg35xx', 'advanced'], false),

('Multi-System Emulation Box', 'multi-system-emulation-box', 'Building a dedicated emulation system with Raspberry Pi and RetroPie', 'Intermediate', '2-3 hours', '/placeholder.svg?height=400&width=600', 'Create a dedicated retro gaming console using Raspberry Pi 4 and RetroPie for the ultimate emulation experience.',
 ARRAY['Raspberry Pi 4', 'MicroSD Card (32GB+)', 'USB Controllers', 'HDMI Cable'], 
 '[{"step": 1, "title": "Install RetroPie", "description": "Flash RetroPie image to SD card"}, {"step": 2, "title": "Initial Setup", "description": "Configure controllers and basic settings"}, {"step": 3, "title": "Add Systems", "description": "Install additional emulators and BIOS files"}, {"step": 4, "title": "Customize Interface", "description": "Set up themes and customize the interface"}]'::jsonb,
 ARRAY['raspberry-pi', 'retropie', 'diy', 'intermediate'], false);

-- Insert sample setup components
INSERT INTO public.setup_components (setup_id, component_type, component_id, component_name, component_description, is_required) VALUES
-- Steam Deck setup components
(1, 'handheld', 1, 'Steam Deck', 'Primary gaming device', true),
(1, 'tool', 1, 'EmuDeck', 'All-in-one emulation installer', true),
(1, 'emulator', 1, 'RetroArch', 'Multi-system emulator', true),

-- ROG Ally setup components  
(2, 'handheld', 2, 'ROG Ally', 'Windows handheld gaming device', true),
(2, 'tool', 2, 'Playnite', 'Game library manager', true),
(2, 'emulator', 1, 'RetroArch', 'Multi-system emulator', true),

-- Anbernic setup components
(3, 'handheld', 3, 'Anbernic RG35XX', 'Retro handheld device', true),
(3, 'custom_firmware', 1, 'Custom Firmware', 'Enhanced firmware for better performance', true),

-- Multi-system setup components
(4, 'tool', 3, 'RetroPie', 'Raspberry Pi emulation distribution', true),
(4, 'emulator', 1, 'RetroArch', 'Multi-system emulator', true);
