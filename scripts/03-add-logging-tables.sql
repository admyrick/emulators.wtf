-- Create error logging table
CREATE TABLE error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    stack TEXT,
    context JSONB,
    user_agent TEXT,
    url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create general app logging table
CREATE TABLE app_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
    message TEXT NOT NULL,
    data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX idx_app_logs_timestamp ON app_logs(timestamp DESC);
CREATE INDEX idx_app_logs_level ON app_logs(level);

-- Enable Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (only allow service role to read/write logs)
CREATE POLICY "Service role can manage error logs" ON error_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage app logs" ON app_logs
    FOR ALL USING (auth.role() = 'service_role');
