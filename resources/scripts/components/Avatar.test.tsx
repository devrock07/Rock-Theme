import fs from 'fs';
import path from 'path';
import React from 'react';
import { render } from '@testing-library/react';
import BoringAvatar from 'boring-avatars';

describe('Avatar React compatibility', () => {
    it('keeps the runtime dependencies on the verified React 16 versions', () => {
        const dependencies = JSON.parse(
            fs.readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf8')
        ).dependencies;

        expect(dependencies['@preact/signals-react']).toBe('1.2.1');
        expect(dependencies['boring-avatars']).toBe('1.7.0');
    });

    it('renders an SVG with the supported avatar package', () => {
        expect(React.version).toMatch(/^16\.14\./);

        const { container } = render(<BoringAvatar name={'Rockdactyl'} size={40} variant={'beam'} />);

        expect(container.querySelector('svg')).toBeInTheDocument();
    });
});
