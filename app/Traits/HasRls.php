<?php

namespace App\Traits;

use App\Scopes\RlsScope;

trait HasRls
{
    /**
     * Boot the Row Level Security trait for the model.
     */
    public static function bootHasRls(): void
    {
        static::addGlobalScope(new RlsScope);
    }
}
