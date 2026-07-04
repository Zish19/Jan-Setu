import logging
import json
import sys
from datetime import datetime

class StructuredLogger(logging.Logger):
    def _log(self, level, msg, args, exc_info=None, extra=None, stack_info=False, stacklevel=1):
        if extra is None:
            extra = {}
        
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": logging.getLevelName(level),
            "message": str(msg),
            **extra
        }
        
        super()._log(level, json.dumps(log_record), args, exc_info, None, stack_info, stacklevel)

logging.setLoggerClass(StructuredLogger)
logging.basicConfig(level=logging.INFO, stream=sys.stdout, format='%(message)s')

def get_logger(name: str):
    return logging.getLogger(name)
