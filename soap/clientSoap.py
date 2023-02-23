from zeep import Client

client = Client('http://localhost:8000/?wsdl')
result = client.service.say_hello("Mathis", 2)

distance = 7
vitesse_moyenne = 5

result2 = client.service.temps_trajet(distance, vitesse_moyenne)

print(
    "Trajet de " + str(distance) +
    "km à " + str(vitesse_moyenne) +
    "km/h en " + str(result2) + " h"
)