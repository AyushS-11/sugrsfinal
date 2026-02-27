import { useState, useEffect } from 'react';
import { getComplaints } from '../../api/client.js';
import Heatmap from '../../features/Heatmap.jsx';

export default function SupervisorHeatmap() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await getComplaints();
                setComplaints(res.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div style={{ width: 44, height: 44, border: '3px solid #ec4899', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <Heatmap complaints={complaints} />
        </div>
    );
}
