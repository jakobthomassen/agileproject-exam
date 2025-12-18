import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import { Button } from "../ui/Button";
import { TextInput } from "../ui/TextInput";
import { Trash2 } from "lucide-react";

type Participant = {
    id: number;
    name: string;
    email?: string;
};

type Props = {
    eventId: number;
};

export function ParticipantList({ eventId }: Props) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Add Form State
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [adding, setAdding] = useState(false);

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 50;

    useEffect(() => {
        setParticipants([]);
        setOffset(0);
        setHasMore(true);
        fetchParticipants(0, true);
    }, [eventId]);

    const fetchParticipants = async (currentOffset = 0, reset = false) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/events/${eventId}/participants?skip=${currentOffset}&limit=${LIMIT}`);

            const newParticipants = res.data;
            if (newParticipants.length < LIMIT) {
                setHasMore(false);
            }

            setParticipants(prev => reset ? newParticipants : [...prev, ...newParticipants]);
            setOffset(currentOffset + LIMIT);
        } catch (err) {
            console.error("Failed to load participants", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        fetchParticipants(offset, false);
    };

    const handleAdd = async () => {
        if (!newName.trim()) return;
        setAdding(true);
        try {
            const payload = { event_id: eventId, name: newName, email: newEmail || undefined };
            const res = await axios.post(`${API_URL}/api/events/${eventId}/participants`, payload);
            if (res.data.status === "success") {
                // Add to TOP of list
                setParticipants([res.data.participant, ...participants]);
                setNewName("");
                setNewEmail("");
            }
        } catch (err) {
            console.error("Failed to add participant", err);
            alert("Failed to add participant");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Remove this participant?")) return;
        try {
            await axios.delete(`${API_URL}/api/events/${eventId}/participants/${id}`);
            setParticipants(participants.filter((p) => p.id !== id));
        } catch (err) {
            console.error("Failed to delete participant", err);
        }
    };

    // Filter
    const filtered = participants.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.email && p.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-320px)]">
            {/* Search & Add Bar */}
            {/* Search - Top */}
            <div className="mb-4">
                <TextInput
                    placeholder="Search participants..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="h-px bg-slate-700 my-2" />

            {/* List */}
            <div
                className="flex-1 overflow-y-auto rounded-xl border border-slate-700/50"
                style={{
                    background: `
                        radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 55%),
                        radial-gradient(circle at bottom, rgba(16, 185, 129, 0.16), transparent 55%)
                    `
                }}
            >
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-xs text-gray-400 uppercase sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="p-3 font-semibold border-b border-slate-700/50">Name</th>
                            <th className="p-3 font-semibold border-b border-slate-700/50">Email</th>
                            <th className="p-3 font-semibold border-b border-slate-700/50 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {loading && participants.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center text-gray-500 py-8">Loading...</td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center text-gray-500 py-8 italic">
                                    {participants.length === 0 ? "No participants yet." : "No matches found."}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-3 text-white font-medium">{p.name}</td>
                                    <td className="p-3 text-gray-400 text-sm">{p.email || "—"}</td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-400/10 transition-colors"
                                            title="Remove"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        {hasMore && !loading && participants.length > 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-2">
                                    <button
                                        onClick={handleLoadMore}
                                        className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                                    >
                                        Load more...
                                    </button>
                                </td>
                            </tr>
                        )}
                        {loading && participants.length > 0 && (
                            <tr>
                                <td colSpan={3} className="text-center text-xs text-gray-500 py-2">Loading more...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="h-px bg-slate-700 my-2" />

            {/* Bottom Actions: Manual Add & Import */}
            <div className="flex flex-col gap-4">
                {/* Manual Add */}
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Add Manual Participant</label>
                    <div className="grid grid-cols-[1fr,1fr,auto] gap-2 items-end">
                        <TextInput
                            placeholder="Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                        <TextInput
                            placeholder="Email (Optional)"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                        <Button onClick={handleAdd} disabled={adding || !newName}>
                            {adding ? "Adding..." : "Add"}
                        </Button>
                    </div>
                </div>

                {/* Import Section */}
                <div className="flex items-center gap-2 justify-end">
                    <input
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        id="csv-upload"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Upload logic
                            try {
                                setLoading(true);
                                const formData = new FormData();
                                formData.append("file", file);

                                const res = await axios.post(`${API_URL}/api/events/${eventId}/participants/upload`, formData, {
                                    headers: { "Content-Type": "multipart/form-data" }
                                });

                                if (res.data.status === "success") {
                                    await fetchParticipants(0, true); // Refresh list from start
                                    alert(`Successfully uploaded ${res.data.created} participants!`);
                                }
                            } catch (err: any) {
                                console.error("Upload failed", err);
                                alert("Upload failed: " + (err.response?.data?.detail || err.message));
                            } finally {
                                if (e.target) e.target.value = ""; // Reset input
                                setLoading(false);
                            }
                        }}
                    />
                    <div className="text-xs text-gray-500 mr-2">
                        Expected format: Name, Email (Header row required)
                    </div>
                    <Button variant="secondary" onClick={() => document.getElementById('csv-upload')?.click()}>
                        Import CSV
                    </Button>
                </div>
            </div>

            <div className="text-xs text-gray-500 text-right">
                Showing: {participants.length} loaded
            </div>
        </div>
    );
}
