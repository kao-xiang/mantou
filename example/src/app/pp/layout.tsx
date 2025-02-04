// src/layout.tsx
import type { GenerateMetadata } from 'mantou'

export default function Layout({ children }: any) {
    return (
        <div>
            {children}
        </div>
    )
}

export const generateMetadata: GenerateMetadata = () => {
    return {
        title: 'Mantou Example',
        description: 'Mantou Example API',
    }
}