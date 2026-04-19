import asyncio

from proxy import KcpProxyViewer
from sense_hat import SenseHat
from websocket import KcpWebSocketClient

sense = SenseHat()
# sense.set_rotation(90)

print(sense.get_temperature_from_pressure())
print(sense.get_temperature_from_humidity())
print(sense.get_humidity())

o = sense.get_orientation()
pitch = o["pitch"]
roll = o["roll"]
yaw = o["yaw"]
print("pitch {0} roll {1} yaw {2}".format(pitch, roll, yaw))


def render(matrix, _=None):
    BLACK = (int(0), int(0), int(0))
    pixels = [BLACK] * 64
    value = int(0)
    for i, char in enumerate(matrix):
        value = ord(char) - 48  # starts from ascii '0'
        pixels[i] = (
            85 * (value >> 4),
            85 * ((value & 0b00001100) >> 2),
            85 * (value & 0b11),
        )

    sense.set_pixels(pixels)


# Creeper face as splashscreen - inspired by Raspberry Pi's SenseHAT Setup Guide
render("8888888888888888800880088008800888800888880000888800008888088088")


async def main():
    print("started")
    client = KcpWebSocketClient(
        "ws://192.168.0.20:3000/kisdb-ws",
        "94de889064a147c3a960d289356858dc6a384b2a90c04f078a47bd87ddef7137",
    )
    await asyncio.sleep(1)
    PUBLIC = KcpProxyViewer(client, "public")
    PLAYER = KcpProxyViewer(client, "controls")

    await PUBLIC.matrix.onnow(render)

    while 1:
        await asyncio.sleep(0.01)
        for event in sense.stick.get_events():
            if not event.action == "pressed":
                continue
            await getattr(PLAYER, event.direction)()


if __name__ == "__main__":
    asyncio.run(main())
