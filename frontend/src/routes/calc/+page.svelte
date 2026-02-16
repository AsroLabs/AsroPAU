<script lang="ts">
    let bachiller: number = $state(0);
    let pau: number = $state(0);

    const calcNota = (bachiller: number, pau: number): number =>
        0.6 * bachiller + 0.4 * pau;
    let resultado: number = $state(0);
</script>

<form class="w-full max-w-md space-y-4 p-4">
    <input type="number" name="bachiller" bind:value={bachiller} />
    <input type="number" name="pau" bind:value={pau} />
    <button onclick={() => (resultado = calcNota(bachiller, pau))}
        >Calcular</button
    >
</form>
<h1>
    Resultado: {resultado}
</h1>
