from django.core.cache import cache


def get_cached_queryset(model, cache_key, timeout=60*15):
    queryset = cache.get(cache_key)
    if not queryset:
        queryset = model.objects.all()
        cache.set(cache_key, queryset, timeout=timeout)
    return queryset
