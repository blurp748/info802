from spyne import Application, rpc, ServiceBase, \
    Integer, Unicode , Decimal
from spyne import Iterable
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication
import decimal
from wsgiref.simple_server import make_server

# Le service va dire autant que fois qu'on le demande notre nom
class HelloWorldService(ServiceBase):
    @rpc(Unicode, Integer, _returns=Iterable(Unicode))
    def say_hello(ctx, name, times):
        for i in range(times):
            yield u'Hello, %s' % name

    @rpc(Decimal, Decimal, _returns=Decimal)
    def temps_trajet(ctx, distance, vitesse_moyenne):
        ctx.transport.resp_headers['Access-Control-Allow-Origin'] = '*'
        return (distance / vitesse_moyenne)

application = Application([HelloWorldService], 'spyne.examples.hello.soap',
        in_protocol=Soap11(validator='lxml'),
        out_protocol=Soap11())
wsgi_application = WsgiApplication(application)


server = make_server('localhost', 8000, wsgi_application)
server.serve_forever()