#
# The main.py has very little if any LLM generated code
#
import asyncio

from proxy import KcpProxyViewer
from sense_hat import SenseHat
from websocket import KcpWebSocketClient

sense = SenseHat()
# sense.set_rotation(90)

print(sense.get_temperature_from_pressure())
print(sense.get_temperature_from_humidity())
print(sense.get_humidity())


def gyro():
    o = sense.get_orientation()
    pitch = o["pitch"]
    roll = o["roll"]
    yaw = o["yaw"]
    return [pitch, roll, yaw]


def accel():
    a = sense.get_accelerometer_raw()
    x = a["x"]
    y = a["y"]
    z = a["z"]
    return [x, y, z]


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
def splashscreen():
    render("8888888888888888800880088008800888800888880000888800008888088088")


splashscreen()


async def main():
    print("started")

    connected = False

    def connstate(ok: bool):
        nonlocal connected
        connected = ok
        if not ok:
            splashscreen()

    selected = ""

    def activeScreen(game, _):
        nonlocal selected
        selected = game

    client = KcpWebSocketClient(
        "ws://192.168.0.20:3000/kisdb-ws",
        "94de889064a147c3a960d289356858dc6a384b2a90c04f078a47bd87ddef7137",
        connstate,
    )
    await asyncio.sleep(1)
    PUBLIC = KcpProxyViewer(client, "public")
    PLAYER = KcpProxyViewer(client, "controls")

    await PUBLIC.game.onnow(activeScreen)
    await PUBLIC.matrix.onnow(render)

    count = 0
    while 1:
        try:
            await asyncio.sleep(0.01)

            for event in sense.stick.get_events():
                if event.action == "held":
                    continue
                if (
                    not connected
                    and event.action == "pressed"
                    and event.direction == "middle"
                ):
                    exit(1)

                await getattr(PLAYER, event.direction)(
                    True if event.action == "pressed" else False
                )

            if not connected:
                continue

            count += 1

            if selected == "gyro":
                await PLAYER.gyro(gyro())
            elif selected == "accel" or count >= 20:  # roughly 5 Hz
                count = 0
                await PLAYER.accel(accel())
        except Exception as err:
            print(err)


if __name__ == "__main__":
    asyncio.run(main())
