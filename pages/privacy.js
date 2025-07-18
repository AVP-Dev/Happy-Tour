// pages/privacy.js
import Head from 'next/head';
import { Box, Container, Heading, Text, List, ListItem, VStack, Divider } from '@chakra-ui/react';

// Вспомогательные компоненты для стилизации текста для консистентности
const Section = ({ children }) => (
    <Box as="section" mb={10}>
        {children}
    </Box>
);

const MainHeading = (props) => (
    <Heading as="h1" size="xl" textAlign="center" mb={2} color="gray.800" {...props} />
);

const Subtitle = (props) => (
    <Text textAlign="center" color="gray.600" fontSize="lg" mb={10} {...props} />
);

const SectionHeading = (props) => (
    <Heading as="h2" size="lg" mt={8} mb={4} color="gray.700" fontWeight="bold" borderBottomWidth="2px" borderColor="brand.200" pb={2} {...props} />
);

const SubHeading = (props) => (
    <Heading as="h3" size="md" mt={6} mb={3} color="gray.600" fontWeight="semibold" {...props} />
);

const Paragraph = (props) => (
    <Text mb={4} lineHeight="tall" color="gray.700" {...props} />
);

const StyledList = (props) => (
    <VStack as={List} spacing={3} pl={5} mb={4} align="stretch" {...props} />
);

export default function PrivacyPage() {
    return (
        <>
            <Head>
                <title>Политика конфиденциальности - Happy Tour</title>
                <meta name="description" content="Политика конфиденциальности и соглашение на обработку персональных данных ООО «ХэппиТрэвелКлаб»." />
            </Head>
            {/* ИЗМЕНЕНИЕ: Убрал `bg="white"` чтобы фоновый паттерн был виден */}
            <Box py={{ base: 24, md: 32 }}>
                <Container maxW="container.lg">
                    <MainHeading>Политика конфиденциальности</MainHeading>
                    <Subtitle>(Соглашение на обработку конфиденциальных личных данных)</Subtitle>

                    <Section>
                        <SectionHeading>Общие положения</SectionHeading>
                        <Paragraph>Политика конфиденциальности действует в отношении всех персональных данных (далее – данные), которые ООО «ХэппиТрэвелКлаб» может получить от субъекта персональных данных, от пользователя сети Интернет (далее - Пользователь) во время использования им интернет-портала happytour.by.</Paragraph>
                        <Paragraph>Использование интернет-портала happytour.by означает безоговорочное согласие Пользователя с настоящей Политикой и условиями обработки его персональной информации; в случае несогласия с этими условиями Пользователю следует воздержаться от использования интернет-портала happytour.by.</Paragraph>
                        <Paragraph>Целью настоящей Политики является обеспечение надлежащей защиты информации о Пользователях, в том числе их персональных данных, от несанкционированного доступа и разглашения.</Paragraph>
                        <Paragraph>Отношения, связанные со сбором, хранением, распространением и защитой информации, предоставляемой Пользователем, регулируются настоящей Политикой, иными официальными документами и действующим законодательством Республики Беларусь (закон Республики Беларусь от 07.05.2021 №99-3 «О защите персональных данных»).</Paragraph>
                    </Section>

                    <Section>
                        <SectionHeading>1. Термины и определения</SectionHeading>
                        <StyledList>
                            <ListItem><strong>ООО «ХэппиТрэвелКлаб»</strong> - юридическое лицо, созданное для оказания комплекса туристических услуг на платной (возмездной) основе гражданам Республики Беларусь, иностранным гражданам и лицам без гражданства. Уполномоченные сотрудники предприятия осуществляют обработку персональных данных, а также определяют цели обработки персональных данных, состав персональных данных, подлежащих обработке, действия (операции), совершаемые с персональными данными.</ListItem>
                            <ListItem><strong>Субъект персональных данных</strong> - пользователи интернет-портала happytour.by, заказчики, партнеры и контрагенты ООО «ХэппиТрэвелКлаб».</ListItem>
                            <ListItem><strong>Персональные данные</strong> - любая информация, относящаяся к субъекту персональных данных, в том числе его фамилия, имя, отчество, дата рождения, адрес, контактные телефоны, адрес электронной почты и прочие сведения.</ListItem>
                            <ListItem><strong>Обработка персональных данных</strong> - любое действие или совокупность действий, совершаемых с персональными данными, включая сбор, запись, систематизацию, хранение, уточнение, использование, передачу, удаление, уничтожение.</ListItem>
                        </StyledList>
                    </Section>

                    <Section>
                        <SectionHeading>2. Предмет политики конфиденциальности</SectionHeading>
                        <Paragraph>Настоящая Политика устанавливает обязательства ООО «ХэппиТрэвелКлаб» по неразглашению и обеспечению режима защиты персональных данных, которые Пользователь предоставляет при оформлении заявки на интернет-портале.</Paragraph>
                        <Paragraph>Предоставляя свои персональные данные, Пользователь соглашается на их обработку в целях предоставления ему справочной и рекламной информации и в иных целях согласно п.3 настоящей Политики.</Paragraph>
                        <SubHeading>2.3. Персональные данные, разрешенные к обработке, могут включать:</SubHeading>
                        <StyledList styleType="disc">
                            <ListItem>фамилия, имя, отчество;</ListItem>
                            <ListItem>дата рождения;</ListItem>
                            <ListItem>номер контактного телефона;</ListItem>
                            <ListItem>адрес электронной почты (e-mail);</ListItem>
                            <ListItem>паспортные данные (на этапе заключения договора).</ListItem>
                        </StyledList>
                        <SubHeading>2.4. Интернет-портал защищает данные, которые автоматически передаются при посещении страниц:</SubHeading>
                        <StyledList styleType="disc">
                            <ListItem>IP-адрес;</ListItem>
                            <ListItem>информация из cookies;</ListItem>
                            <ListItem>информация о браузере;</ListItem>
                            <ListItem>время доступа.</ListItem>
                        </StyledList>
                    </Section>
                    
                    <Section>
                        <SectionHeading>3. Цели обработки персональных данных</SectionHeading>
                        <StyledList styleType="disc">
                            <ListItem>Обработки запросов и заявок от Пользователя.</ListItem>
                            <ListItem>Коммуникации с Пользователем (направление уведомлений, сообщений).</ListItem>
                            <ListItem>Оказания туристических услуг и соблюдения условий договора.</ListItem>
                            <ListItem>Публикации отзывов и комментариев Пользователя.</ListItem>
                            <ListItem>Информирования Пользователя об акциях и специальных предложениях.</ListItem>
                            <ListItem>Оценки и анализа эффективности работы интернет-портала.</ListItem>
                        </StyledList>
                    </Section>

                    <Section>
                        <SectionHeading>4. Способы обработки персональных данных</SectionHeading>
                        <Paragraph>Обработка персональных данных Пользователя осуществляется без ограничения срока, любым законным способом.</Paragraph>
                        <Paragraph>Пользователь соглашается с тем, что ООО «ХэппиТрэвелКлаб» вправе передавать персональные данные третьим лицам (экскурсоводам, гостиницам, перевозчикам) исключительно в целях выполнения условий договора оказания туристических услуг.</Paragraph>
                        <Paragraph>Персональные данные Пользователя могут быть переданы уполномоченным органам государственной власти Республики Беларусь только по основаниям и в порядке, установленным законодательством.</Paragraph>
                    </Section>

                    <Section>
                        <SectionHeading>5. Права субъекта персональных данных</SectionHeading>
                        <Paragraph>Субъект персональных данных имеет право на получение информации, касающейся обработки его данных, на доступ к своим данным, а также требовать их уточнения, блокирования или уничтожения.</Paragraph>
                        <Paragraph>Для отзыва согласия на обработку персональных данных Пользователь должен направить официальный запрос на адрес электронной почты info@happytour.by с темой «Прекратить обработку персональных данных».</Paragraph>
                    </Section>

                    <Section>
                        <SectionHeading>6. Сроки обработки (хранения) персональных данных</SectionHeading>
                        <Paragraph>Срок обработки персональных данных определяется целью их обработки, сроком действия гражданско-правовых отношений между сторонами и требованиями законодательства.</Paragraph>
                    </Section>

                    <Section>
                        <SectionHeading>7. Обязательства сторон</SectionHeading>
                        <SubHeading>7.1. Пользователь обязан:</SubHeading>
                        <StyledList styleType="disc">
                           <ListItem>Предоставить полную и достоверную информацию о персональных данных.</ListItem>
                           <ListItem>Обновлять предоставленную информацию в случае ее изменения.</ListItem>
                        </StyledList>
                        <SubHeading>7.2. Администрация интернет-портала happytour.by обязана:</SubHeading>
                        <StyledList styleType="disc">
                           <ListItem>Использовать полученную информацию исключительно для целей, указанных в настоящей Политике.</ListItem>
                           <ListItem>Обеспечить хранение конфиденциальной информации в тайне.</ListItem>
                           <ListItem>Принимать необходимые меры для защиты персональной информации от неправомерного доступа.</ListItem>
                        </StyledList>
                    </Section>

                    <Section>
                        <SectionHeading>8. Заключительные положения</SectionHeading>
                        <Paragraph>Настоящая Политика является общедоступным документом и подлежит размещению на интернет-портале happytour.by.</Paragraph>
                        <Paragraph>Администрация вправе вносить изменения в настоящую Политику без согласия Пользователей. Новая Политика вступает в силу с момента ее размещения на сайте.</Paragraph>
                    </Section>
                </Container>
            </Box>
        </>
    );
}
