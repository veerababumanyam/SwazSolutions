
import React, { useState } from 'react';
import {
    Library, Heart, Disc, ListMusic, Plus, Folder,
    MoreVertical, Edit2, Trash2, ChevronDown, Music, X, RefreshCw, HardDrive, Mic2
} from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';

export type ViewType =
    | { type: 'all' }
    | { type: 'favorites' }
    | { type: 'albums' }
    | { type: 'album-detail', id: string }
    | { type: 'playlist', id: string }
    | { type: 'now-playing' }
    | { type: 'lyrics' };

interface MusicSidebarProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    currentView: ViewType;
    onNavigate: (view: ViewType) => void;
}

export const MusicSidebar: React.FC<MusicSidebarProps> = ({ isOpen, setIsOpen, currentView, onNavigate }) => {
    const { playlists, albums, library, createPlaylist, deletePlaylist, renamePlaylist, isScanning, connectLocalLibrary, refreshLibrary, lastScanTime } = useMusic();

    // UI State
    const [isPlaylistsExpanded, setIsPlaylistsExpanded] = useState(true);
    const [isAlbumsExpanded, setIsAlbumsExpanded] = useState(true);
    const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [contextMenu, setContextMenu] = useState<{ id: string, x: number, y: number } | null>(null);

    const handleCreate = () => {
        if (newPlaylistName.trim()) {
            createPlaylist(newPlaylistName.trim());
            setNewPlaylistName('');
            setShowCreateModal(false);
            setIsPlaylistsExpanded(true);
        }
    };

    const startRename = (id: string, currentName: string) => {
        setEditingPlaylistId(id);
        setEditName(currentName);
        setContextMenu(null);
    };

    const saveRename = () => {
        if (editingPlaylistId && editName.trim()) {
            renamePlaylist(editingPlaylistId, editName.trim());
            setEditingPlaylistId(null);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this playlist?')) {
            deletePlaylist(id);
            if (currentView.type === 'playlist' && currentView.id === id) {
                onNavigate({ type: 'all' });
            }
        }
        setContextMenu(null);
    };

    const sidebarClass = `
        fixed inset-y-0 left-0 z-40 w-72 bg-surface/95 backdrop-blur-xl border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-5rem)] lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    const NavItem = ({ view, icon: Icon, label, count, depth = 0 }: { view: ViewType, icon: any, label: string, count?: number, depth?: number, key?: any }) => {
        const isActive = currentView.type === view.type &&
            (
                (view.type === 'playlist' && currentView.type === 'playlist' && view.id === currentView.id) ||
                (view.type === 'album-detail' && currentView.type === 'album-detail' && view.id === currentView.id) ||
                (view.type !== 'playlist' && view.type !== 'album-detail')
            );

        return (
            <button
                onClick={() => {
                    onNavigate(view);
                    if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-accent/10 text-accent font-bold' : 'text-secondary hover:bg-background hover:text-primary'}`}
                style={{ paddingLeft: `${depth * 1 + 0.75}rem` }}
            >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'fill-current' : ''}`} />
                <span className="flex-1 text-left truncate">{label}</span>
                {count !== undefined && <span className="text-xs font-medium opacity-60">{count}</span>}
            </button>
        );
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={sidebarClass}>
                <div className="flex flex-col h-full pt-20 lg:pt-0">
                    {/* Header */}
                    <div className="p-6 pb-2 lg:hidden flex items-center justify-between">
                        <h2 className="text-xl font-black text-primary flex items-center gap-2">
                            <Library className="w-6 h-6 text-accent" /> Library
                        </h2>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-background rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin">

                        {/* Scan Status Bar */}
                        <div className="mb-4 p-3 bg-background/50 rounded-xl border border-border/50 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {isScanning ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 text-accent animate-spin flex-shrink-0" />
                                        <span className="text-xs font-bold text-accent truncate">Scanning files...</span>
                                    </>
                                ) : library.length > 0 ? (
                                    <>
                                        <Music className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-primary truncate">{library.length} songs loaded</span>
                                            {lastScanTime > 0 && (
                                                <span className="text-[10px] text-muted truncate">
                                                    {new Date(lastScanTime).toLocaleTimeString()}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Music className="w-4 h-4 text-muted flex-shrink-0" />
                                        <span className="text-xs text-muted truncate">No files found</span>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={refreshLibrary}
                                disabled={isScanning}
                                className="p-2 hover:bg-background rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                                title="Refresh Library"
                            >
                                <RefreshCw className={`w-4 h-4 text-secondary ${isScanning ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Fallback Load Button (Only if auto-discovery failed) */}
                        {library.length === 0 && !isScanning && (
                            <div className="mb-4">
                                <button
                                    onClick={connectLocalLibrary}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-accent/10 text-accent font-bold hover:bg-accent hover:text-white transition-colors border border-accent/20 shadow-sm"
                                >
                                    <HardDrive className="w-4 h-4" /> Load "MusicFiles" Folder
                                </button>
                                <p className="text-[10px] text-center text-muted mt-2 px-2">
                                    Auto-discovery unavailable. Select your "data/MusicFiles" folder to play.
                                </p>
                            </div>
                        )}

                        {/* Scanning Indicator */}
                        {isScanning && (
                            <div className="px-3 py-2 bg-accent/5 rounded-xl border border-accent/10 flex items-center justify-center gap-2 text-xs text-accent font-bold animate-pulse">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Disovering Files...
                            </div>
                        )}

                        {/* Main Library */}
                        <div className="space-y-1">
                            <h3 className="px-3 text-xs font-bold text-secondary uppercase tracking-wider mb-2">Collection</h3>
                            <NavItem view={{ type: 'all' }} icon={Music} label="All Songs" />
                            <NavItem view={{ type: 'favorites' }} icon={Heart} label="Liked Songs" />
                            <NavItem view={{ type: 'lyrics' }} icon={Mic2} label="Lyrics" />
                        </div>

                        {/* Albums (Folders) */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between px-3 mb-2 group cursor-pointer" onClick={() => setIsAlbumsExpanded(!isAlbumsExpanded)}>
                                <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">Albums</h3>
                                <button className="p-1 hover:bg-background rounded transition-colors">
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isAlbumsExpanded ? '' : '-rotate-90'}`} />
                                </button>
                            </div>

                            <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isAlbumsExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <NavItem view={{ type: 'albums' }} icon={Disc} label="All Albums" />
                                {albums.length > 0 ? albums.map(album => (
                                    <NavItem
                                        key={album.id}
                                        view={{ type: 'album-detail', id: album.id }}
                                        icon={Folder}
                                        label={album.title}
                                        depth={1}
                                    />
                                )) : (
                                    <div className="px-6 py-2 text-xs text-muted italic">
                                        {!isScanning && 'No albums found'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Playlists */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between px-3 mb-2 group">
                                <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">Playlists</h3>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="p-1 hover:bg-accent/10 hover:text-accent rounded transition-colors"
                                        title="Create Playlist"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsPlaylistsExpanded(!isPlaylistsExpanded)}
                                        className="p-1 hover:bg-background rounded transition-colors"
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isPlaylistsExpanded ? '' : '-rotate-90'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isPlaylistsExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                {playlists.map(playlist => (
                                    <div key={playlist.id} className="relative group">
                                        {editingPlaylistId === playlist.id ? (
                                            <div className="p-2 flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                                                    autoFocus
                                                    className="w-full bg-background border border-accent rounded px-2 py-1 text-sm"
                                                />
                                                <button onClick={saveRename} className="text-accent"><Disc className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <NavItem
                                                    view={{ type: 'playlist', id: playlist.id }}
                                                    icon={ListMusic}
                                                    label={playlist.name}
                                                    count={playlist.trackIds.length}
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setContextMenu({ id: playlist.id, x: rect.right, y: rect.top });
                                                    }}
                                                    className="absolute right-2 p-1.5 text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-background"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {playlists.length === 0 && (
                                    <div className="p-4 text-center border border-dashed border-border rounded-xl text-xs text-muted">
                                        No playlists yet.
                                        <button onClick={() => setShowCreateModal(true)} className="text-accent hover:underline block w-full mt-1">Create one</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Context Menu */}
            {contextMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
                    <div
                        className="fixed z-50 bg-surface border border-border shadow-xl rounded-xl p-1 min-w-[150px] animate-scale-in"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button
                            onClick={() => {
                                const pl = playlists.find(p => p.id === contextMenu.id);
                                if (pl) startRename(pl.id, pl.name);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-background rounded-lg text-left"
                        >
                            <Edit2 className="w-4 h-4" /> Rename
                        </button>
                        <button
                            onClick={() => handleDelete(contextMenu.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg text-left"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-scale-in">
                        <h3 className="text-lg font-bold text-primary mb-4">New Playlist</h3>
                        <input
                            type="text"
                            placeholder="My Awesome Mix"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            autoFocus
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 mb-6 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newPlaylistName.trim()}
                                className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 hover:bg-accent-hover transition-colors disabled:opacity-50"
                            >
                                Create Playlist
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
