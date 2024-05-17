/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/api/websocket',
                headers: [
                    {
                        key: 'Connection',
                        value: 'Upgrade',
                    },
                ],
            },
        ];
    }
};

export default nextConfig;
