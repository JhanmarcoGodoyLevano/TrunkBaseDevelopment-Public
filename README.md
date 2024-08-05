# Proyecto Divinex

Este proyecto utiliza Trunk-Based Development (TBD) como metodología principal de desarrollo, asegurando un flujo de trabajo ágil y colaborativo que minimiza la complejidad de la integración y facilita la entrega continua.

## Trunk-Based Development

Trunk-Based Development es una estrategia de desarrollo de software que se centra en mantener una sola rama principal (trunk) en la que los desarrolladores integran su trabajo con frecuencia. Este enfoque fomenta una entrega continua y facilita la colaboración entre equipos.

### Características Principales de TBD en este Proyecto

- **Ramas de Vida Corta**: Las ramas se mantienen por períodos cortos y se fusionan rápidamente al trunk para minimizar la divergencia y los conflictos.
- **Integración Continua**: Las integraciones frecuentes aseguran que el código esté siempre en un estado desplegable.
- **Entrega Continua**: El código que está en el trunk está listo para ser desplegado en producción en cualquier momento.

## Estrategia de Ramas

En este repositorio, seguimos un esquema de ramas que incluye `feature`, `hotfix`, y el uso de SonarCloud para asegurar la calidad del código:

### Ramas `feature`

- **Propósito**: Se utilizan para desarrollar nuevas funcionalidades de manera aislada.
- **Duración**: Son de corta duración y se fusionan rápidamente al trunk (`main`) una vez que el desarrollo está completo y probado.
- **Ejemplo de nombre**: `feature/nueva-funcionalidad`

### Ramas `hotfix`

- **Propósito**: Se utilizan para corregir errores críticos que afectan la producción.
- **Duración**: Son temporales y se fusionan de vuelta al trunk (`main`) lo más rápido posible.
- **Ejemplo de nombre**: `hotfix/correccion-error-importante`

### Uso de SonarCloud

SonarCloud se integra en nuestro flujo de trabajo para proporcionar análisis continuo de la calidad del código, asegurando que el código sea limpio, seguro, y mantenible:

- **Análisis de Calidad**: SonarCloud analiza automáticamente el código en busca de errores, vulnerabilidades y problemas de mantenibilidad cada vez que se realiza un commit o una fusión.
- **Cobertura de Código**: Mide la cobertura de las pruebas para identificar áreas del código que necesitan más atención.


