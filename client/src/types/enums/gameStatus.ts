export type GameStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned' | 'on_hold' | 'active_multiplayer' | 'casual_rotation' | 'retired' | 'replaying';

export const GameStatusLabels: Record<GameStatus, string> = {
    'not_started': 'Not Started',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'abandoned': 'Abandoned',
    'on_hold': 'On Hold',
    'active_multiplayer': 'Active Multiplayer',
    'casual_rotation': 'Casual Rotation',
    'retired': 'Retired',
    'replaying': 'Replaying'
}; 