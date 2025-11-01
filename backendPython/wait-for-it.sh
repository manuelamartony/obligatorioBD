#!/bin/sh
set -e

hostport="$1"
shift
cmd="$@"

host=$(echo "$hostport" | cut -d: -f1)
port=$(echo "$hostport" | cut -d: -f2)

until nc -z "$host" "$port"; do
  echo "⏳ Esperando a que MySQL ($host:$port) esté disponible..."
  sleep 2
done

>&2 echo "✅ MySQL está listo, iniciando aplicación"
exec $cmd
