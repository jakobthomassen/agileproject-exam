import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import { Button } from "../ui/Button";
import { TextInput } from "../ui/TextInput";

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
        <div className="flex flex-col gap-4 h-full">
            {/* Search & Add Bar */}
            <div className="grid grid-cols-[1fr,1fr,auto] gap-2 items-end">
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Name</label>
                    <TextInput
                        placeholder="Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Email (Optional)</label>
                    <TextInput
                        placeholder="Email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                </div>
                <Button onClick={handleAdd} disabled={adding || !newName}>
                    {adding ? "Adding..." : "Add"}
                </Button>
            </div>

            {/* Import Section */}
            <div className="flex items-center gap-2">
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
                <Button variant="secondary" onClick={() => document.getElementById('csv-upload')?.click()}>
                    Import CSV
                </Button>
                <div className="text-xs text-gray-500">
                    Expected format: Name, Email (Header row required)
                </div>
            </div>

            <div className="h-px bg-slate-700 my-2" />

            {/* Search */}
            <TextInput
                placeholder="Search participants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-2"
            />

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] max-h-[400px]">
                {loading && participants.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-gray-500 py-4 italic">
                        {participants.length === 0 ? "No participants yet." : "No matches found."}
                    </div>
                ) : (
                    filtered.map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center justify-between p-3 rounded bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                            <div>
                                <div className="font-medium text-white">{p.name}</div>
                                {p.email && <div className="text-xs text-gray-400">{p.email}</div>}
                            </div>
                            <button
                                onClick={() => handleDelete(p.id)}
                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-400/10 transition-colors"
                                title="Remove"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
                {hasMore && !loading && (
                    <div className="text-center pt-2 pb-2">
                        <button
                            onClick={handleLoadMore}
                            className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                        >
                            Load more...
                        </button>
                    </div>
                )}
                {loading && participants.length > 0 && (
                    <div className="text-center text-xs text-gray-500 py-2">Loading more...</div>
                )}
            </div>

            <div className="text-xs text-gray-500 text-right">
                Showing: {participants.length} loaded
            </div>
        </div>
    );
}
