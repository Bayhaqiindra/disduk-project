<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class RlsScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // Only apply if user is authenticated
        if (Auth::check()) {
            /** @var \App\Models\User $user */
            $user = Auth::user();

            // If the user is a village officer (petugas_desa), only show their own rows
            if ($user->role === 'petugas_desa') {
                $column = method_exists($model, 'getRlsColumn') ? $model->getRlsColumn() : 'user_id';
                $builder->where($model->getTable() . '.' . $column, $user->id);
            }
            
            // If the user is an admin, they can see all rows (no filter applied)
        }
    }
}
