from enum import Enum
class TipoSala(str, Enum):
    libre = "libre"
    posgrado = "posgrado"
    docente = "docente"