curl -X POST "http://localhost:8000/api/v1/plans/generate" \
     -H "Content-Type: application/json" \
     -d '{
           "items": [
             {"item_name": "계란", "quantity": 1},
             {"item_name": "우유", "quantity": 2}
           ]
         }'
