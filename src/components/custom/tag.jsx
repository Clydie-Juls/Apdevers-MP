import { Badge } from '../ui/badge';

const Tag = ({ name }) => {
    return (
        <Badge>#{name}</Badge>
    );
};

export default Tag;